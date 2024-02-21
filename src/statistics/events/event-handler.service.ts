import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
	IComputeResourceBadgesEventPayload,
	IComputeResourceMedalsEventPayload,
	IComputeUserBadgesEventPayload,
	IincrementalBadgeComputeEventPayload,
	onComputeResourceBadges,
	onComputeResourceMedals,
	onComputeUserBadges,
	onIncrementalBadgeCompute,
} from '../../achievements/events';
import { InjectModel } from '@nestjs/mongoose';
import {
	Badge,
	BadgeDocument,
} from '../../core/schemas/achievements/badges.schema';
import { Model } from 'mongoose';
import { AchievementState } from '../../core/enums';
import {
	Statistics,
	StatisticsDocument,
} from '../../core/schemas/statistics.schema';
import {
	Medal,
	MedalDocument,
} from '../../core/schemas/achievements/medals.schema';
import { computePrivacyField } from '../../util/privacy.helper';
import { PartnerResourcesService } from '../../resources/partner-resources/partner-resources.service';
import {
	IUserUpdatePrivacyEventPayload,
	UserUpdatePrivacyEvent,
} from '../../auth/users/events/update-privacy';
import {
	IPostDeleteAllResourceReports,
	IPostReportInsertManyEventPayload,
	IPostReportInsertSingleEventPayload,
	postDeleteAllResourceReports,
	postReportInsertManyEvent,
	postReportInsertSingleEvent,
} from '../../submit-reports/events/events';
import { ComputeStatisticsService } from '../compute-statistics/compute-statistics.service';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import * as _ from 'lodash';
import {
	ITermDeletedEventPayload,
	ITermUpdatedEventPayload,
	onTermDeletedEvent,
	onTermUpdatedEvent,
} from '../../terms/events/events';

@Injectable()
export class StatisticsEventHandlerService {
	constructor(
		@InjectModel(Badge.name) protected badgeModel: Model<BadgeDocument>,
		@InjectModel(Medal.name) protected medalModel: Model<MedalDocument>,
		@InjectModel(Statistics.name)
		protected statModel: Model<StatisticsDocument>,
		protected computeStats: ComputeStatisticsService,
		protected resourceService: PartnerResourcesService,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
	) {}

	logger = new Logger(StatisticsEventHandlerService.name);

	@OnEvent(onIncrementalBadgeCompute, { async: true, promisify: true })
	async updateBadgeCount(payload: IincrementalBadgeComputeEventPayload) {
		const badgeCount = await this.badgeModel.count({
			...payload,
			state: AchievementState.achieved,
		});

		await this.statModel.updateOne(
			{
				...payload,
			},
			{
				$set: {
					badges_count: badgeCount,
				},
			},
		);
	}

	@OnEvent(onComputeUserBadges, { async: true, promisify: true })
	async updateUserBadgeCount(payload: IComputeUserBadgesEventPayload) {
		const stats = this.statModel.findOne(payload).cursor({ batchSize: 10 });

		const statSaves$ = [];
		for await (const stat of stats) {
			stat.badges_count = await this.badgeModel.count({
				resource_id: stat.resource_id,
				curator_orcid: stat.curator_orcid,
				league: stat.league,
				state: AchievementState.achieved,
			});

			statSaves$.push(stat.save());
		}

		await Promise.all(statSaves$);
	}

	@OnEvent(onComputeResourceBadges, { async: true, promisify: true })
	async updateResourceBadgeCount(payload: IComputeResourceBadgesEventPayload) {
		const stats = this.statModel.findOne(payload).cursor({ batchSize: 50 });
		const statSaves$ = [];

		for await (const stat of stats) {
			stat.badges_count = await this.badgeModel.count({
				resource_id: stat.resource_id,
				curator_orcid: stat.curator_orcid,
				league: stat.league,
				state: AchievementState.achieved,
			});

			statSaves$.push(stat.save());
		}

		await Promise.all(statSaves$);
	}

	@OnEvent(onComputeResourceMedals, { async: true, promisify: true })
	async updateResourceMedalCount(payload: IComputeResourceMedalsEventPayload) {
		const stats = this.statModel.findOne(payload).cursor({ batchSize: 50 });
		const statSaves$ = [];

		for await (const stat of stats) {
			stat.medals_count = await this.medalModel.count({
				resource_id: stat.resource_id,
				curator_orcid: stat.curator_orcid,
				league: stat.league,
				state: AchievementState.achieved,
			});
			statSaves$.push(stat.save());
		}

		const updates = await Promise.all(statSaves$);

		return updates.length;
	}

	@OnEvent(UserUpdatePrivacyEvent, { async: true, promisify: true })
	async setUserStatsPrivacy({ user, privacy }: IUserUpdatePrivacyEventPayload) {
		this.logger.log(
			`Handling Update user stat privacy event in statistics service ${user.orcid_id} ${privacy} !`,
		);

		const resourceIdList = (await this.statModel
			.aggregate()
			.match({ curator_orcid: user.orcid_id })
			.group({
				_id: '$resource_id',
				resource_id: { $first: '$resource_id' },
			})) as { _id: string; resource_id: string }[];

		const resourceIds = resourceIdList.map((resource) => resource.resource_id);

		// Retrieve the resources associated with the resource IDs
		const resources = await this.resourceService.get_resources({
			resource_id: { $in: resourceIds },
		});

		// Get the leagues associated with the resources
		const resourceLeagues = resources
			.map((resource) => this.resourceService.getResourceLeagues(resource))
			.flat();

		const updatePromises$ = [];
		for await (const [resource, league] of resourceLeagues) {
			const updatePromise$ = this.statModel.updateMany(
				{
					resource_id: resource.resource_id,
					league: league.name,
					curator_orcid: user.orcid_id,
				},
				{
					$set: {
						privacy: computePrivacyField(resource, user, {
							league: league.name,
						}),
					},
				},
			);
			updatePromises$.push(updatePromise$);
		}

		await Promise.all(updatePromises$);
		return;
	}

	@OnEvent(postReportInsertManyEvent, { async: true, promisify: true })
	async insertManyReportsHandler({
		reports,
	}: IPostReportInsertManyEventPayload) {
		const resourceIds = _.uniq(reports.map((report) => report.resource_id));
		const orcidIds = _.uniq(reports.map((report) => report.curator_orcid));

		await this.computeStats.computeStatistics({
			resource_id: { $in: resourceIds },
			curator_orcid: { $in: orcidIds },
		});
		return;
	}

	@OnEvent(postReportInsertSingleEvent, { async: true, promisify: true })
	async insertSingleReportHandler({
		report,
	}: IPostReportInsertSingleEventPayload) {
		const reportDoc = new this.reportModel(report);
		await this.computeStats.incrementStatByReport(reportDoc);
	}

	@OnEvent(postDeleteAllResourceReports, { async: true, promisify: true })
	async deleteAllResourceReportsHandler(
		deleteAllResourceReportsPayload: IPostDeleteAllResourceReports,
	) {
		await this.statModel.deleteMany({
			resource_id: deleteAllResourceReportsPayload.resource_id,
		});
		return;
	}

	@OnEvent(onTermDeletedEvent, { async: true, promisify: true })
	async onTermDeleted({ term }: ITermDeletedEventPayload) {
		await this.computeStats.computeStatistics({
			resource_id: term.resource_id,
			league: term.league,
		});
	}

	@OnEvent(onTermUpdatedEvent, { async: true, promisify: true })
	async onTermUpdated({ term }: ITermUpdatedEventPayload) {
		await this.computeStats.computeStatistics({
			resource_id: term.resource_id,
			league: term.league,
		});
	}
}
