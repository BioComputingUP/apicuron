import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
	IMedalCountChangeEventPayload,
	onMedalsCompute,
} from '../../achievements/events/events';
import { InjectModel } from '@nestjs/mongoose';
import {
	Badge,
	BadgeDocument,
} from '../../core/schemas/achievements/badges.schema';
import { FilterQuery, Model } from 'mongoose';
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
import { uniq } from 'lodash';
import {
	ITermDeletedEventPayload,
	ITermUpdatedEventPayload,
	onTermDeletedEvent,
	onTermUpdatedEvent,
} from '../../terms/events/events';
import { BadgeDefDocument } from '../../core/schemas/achievements-def/badge-def.schema';
import { onBadgesCompute } from '../../achievements/events/events';
import { AchievementState, AchievementType } from '../../core/enums';
import { AllStatisticsPipelinesOrchestratorService } from '../../aggregation/pipeline-runner/orchestrators/all-statistics-pipelines.service';

@Injectable()
export class StatisticsEventHandlerService {
	constructor(
		@InjectModel(Badge.name) protected badgeModel: Model<BadgeDocument>,
		@InjectModel(Medal.name) protected medalModel: Model<MedalDocument>,
		@InjectModel(Statistics.name)
		protected statModel: Model<StatisticsDocument>,
		protected computeStats: ComputeStatisticsService,
		protected resourceService: PartnerResourcesService,
		protected pipelineOrchestrator: AllStatisticsPipelinesOrchestratorService,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
	) {}

	logger = new Logger(StatisticsEventHandlerService.name);

	@OnEvent(onBadgesCompute, { async: true, promisify: true })
	async updateStatBadgeCount(badgeDefFilter: FilterQuery<BadgeDefDocument>) {
		// retrieve stats linked to the affected badges

		const badgeCounts = this.badgeModel
			.aggregate()
			.match({
				...badgeDefFilter,
				type: AchievementType.badge,
				state: AchievementState.achieved,
			})
			.group({
				_id: {
					resource_id: '$resource_id',
					curator_orcid: '$curator_orcid',
					league: '$league',
				},
				resource_id: { $first: '$resource_id' },
				curator_orcid: { $first: '$curator_orcid' },
				league: { $first: '$league' },
				count: { $sum: 1 },
			})
			.cursor({ batchSize: 50 });

		const statUpdates$ = [];

		for await (const badgeCount of badgeCounts) {
			const { resource_id, curator_orcid, league, count } = badgeCount;
			const update$ = this.statModel.findOneAndUpdate(
				{
					resource_id,
					curator_orcid,
					league,
				},
				{
					$set: {
						badges_count: count,
					},
				},
			);

			statUpdates$.push(update$);
		}

		await Promise.all(statUpdates$);
		return;
	}

	@OnEvent(onMedalsCompute, { async: true, promisify: true })
	async updateMedalCount(medalDefFilter: IMedalCountChangeEventPayload) {
		this.logger.log('updating counts');

		this.logger.log('filter object', {
			...medalDefFilter,
			type: AchievementType.medal,
			state: AchievementState.achieved,
		});

		const medalCounts = this.medalModel
			.aggregate()
			.match({
				...medalDefFilter,
				type: AchievementType.medal,
				state: AchievementState.achieved,
			})
			.group({
				_id: {
					resource_id: '$resource_id',
					curator_orcid: '$curator_orcid',
					league: '$league',
				},
				resource_id: { $first: '$resource_id' },
				curator_orcid: { $first: '$curator_orcid' },
				league: { $first: '$league' },
				count: { $sum: 1 },
			})
			.cursor({ batchSize: 50 });

		const statUpdates$ = [];
		for await (const medalCount of medalCounts) {
			const { resource_id, curator_orcid, league, count } = medalCount;
			const update$ = this.statModel
				.updateOne(
					{
						resource_id,
						curator_orcid,
						league,
					},
					{
						medals_count: count,
					},
				)
				.then((result) => {
					this.logger.log(
						`Updating medal count for stat ${resource_id}/${curator_orcid}/${league} with count ${count} modifiedCount: ${result.modifiedCount}!`,
					);
				});
			statUpdates$.push(update$);
		}

		await Promise.all(statUpdates$);
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
		const resourceIds = uniq(reports.map((report) => report.resource_id));
		const orcidIds = uniq(reports.map((report) => report.curator_orcid));
		await this.pipelineOrchestrator.runAllPipelines({
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
		await this.pipelineOrchestrator.runIncrementalPipelines(reportDoc);
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
		await this.pipelineOrchestrator.runAllPipelines({
			resource_id: term.resource_id,
			league: term.league,
		});
	}

	@OnEvent(onTermUpdatedEvent, { async: true, promisify: true })
	async onTermUpdated({ term }: ITermUpdatedEventPayload) {
		await this.pipelineOrchestrator.runAllPipelines({
			resource_id: term.resource_id,
			league: term.league,
		});
	}
}
