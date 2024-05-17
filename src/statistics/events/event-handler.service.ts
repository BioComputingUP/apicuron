import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import {
	Badge,
	BadgeDocument,
} from '../../core/schemas/achievements/badges.schema';
import { Model } from 'mongoose';
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
	IAllResourceReportsDeletedEventPayload,
	IManyReportsSubmittedEventPayload,
	IReportSubmittedEventPayload,
	AllResourceReportsDeletedEvent,
	ManyReportsSubmittedEvent,
	ReportSubmittedEvent,
} from '../../submit-reports/events/events';
import { ComputeStatisticsService } from '../compute-statistics/compute-statistics.service';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { uniq } from 'lodash';
import {
	ITermDeletedEventPayload,
	ITermUpdatedEventPayload,
	TermDeletedEvent,
	TermUpdatedEvent,
} from '../../terms/events/events';
import { AchievementState } from '../../core/enums';
import { AllStatisticsPipelinesOrchestratorService } from '../../aggregation/pipeline-runner/orchestrators/all-statistics-pipelines.service';
import {
	ResourceMedalsCountUpdatedEvent,
	UserMedalsCountUpdatedEvent,
} from '../../medals/events/medal-count-updated.event';

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

	@OnEvent(ResourceMedalsCountUpdatedEvent.name, {
		promisify: true,
		async: true,
	})
	async updateResourceMedalCount(payload: ResourceMedalsCountUpdatedEvent) {
		const stats = this.statModel
			.find({ resource_id: payload.resource_id })
			.cursor({ batchSize: 50 });

		const statUpdates$ = [];
		for await (const stat of stats) {
			const update$ = this.medalModel
				.countDocuments({
					resource_id: payload.resource_id,
					curator_orcid: stat.curator_orcid,
					league: stat.league,
					state: AchievementState.achieved,
				})
				.then((count: number) => {
					stat.medals_count = count;
					return stat.save();
				});
			statUpdates$.push(update$);
		}
		await Promise.all(statUpdates$);
	}

	@OnEvent(UserMedalsCountUpdatedEvent.name, { promisify: true, async: true })
	async updateUserMedalCount(payload: UserMedalsCountUpdatedEvent) {
		const filter = {
			resource_id: payload.resource_id,
			curator_orcid: payload.curator_orcid,
			league: payload.league,
		};
		const medalCount = await this.medalModel.countDocuments(filter);

		await this.statModel.findOneAndUpdate(filter, {
			$set: { medals_count: medalCount },
		});
		return;
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

	@OnEvent(ManyReportsSubmittedEvent, { async: true, promisify: true })
	async insertManyReportsHandler({
		reports,
	}: IManyReportsSubmittedEventPayload) {
		const resourceIds = uniq(reports.map((report) => report.resource_id));
		const orcidIds = uniq(reports.map((report) => report.curator_orcid));
		await this.pipelineOrchestrator.runAllPipelines({
			resource_id: { $in: resourceIds },
			curator_orcid: { $in: orcidIds },
		});
		return;
	}

	@OnEvent(ReportSubmittedEvent, { async: true, promisify: true })
	async insertSingleReportHandler({ report }: IReportSubmittedEventPayload) {
		const reportDoc = new this.reportModel(report);
		await this.computeStats.incrementStatByReport(reportDoc);
		await this.pipelineOrchestrator.runIncrementalPipelines(reportDoc);
	}

	@OnEvent(AllResourceReportsDeletedEvent, { async: true, promisify: true })
	async deleteAllResourceReportsHandler(
		deleteAllResourceReportsPayload: IAllResourceReportsDeletedEventPayload,
	) {
		await this.statModel.deleteMany({
			resource_id: deleteAllResourceReportsPayload.resource_id,
		});
		return;
	}

	@OnEvent(TermDeletedEvent, { async: true, promisify: true })
	async onTermDeleted({ term }: ITermDeletedEventPayload) {
		await this.pipelineOrchestrator.runAllPipelines({
			resource_id: term.resource_id,
			league: term.league,
		});
	}

	@OnEvent(TermUpdatedEvent, { async: true, promisify: true })
	async onTermUpdated({ term }: ITermUpdatedEventPayload) {
		await this.pipelineOrchestrator.runAllPipelines({
			resource_id: term.resource_id,
			league: term.league,
		});
	}
}
