import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EntityCreatedEvent, EntityUpdatedEvent } from '../../core/events';
import {
	LeanReportDocument,
	ReportDocument,
} from '../../core/schemas/reports.schema';
import { PartnerResourceDocument } from '../../core/schemas/resource/partner-resource.schema';
import {
	DetailedStatistics,
	DetailedStatisticsDocument,
} from '../../core/schemas/statistics/detailed-statistics.schema';
import { TermDocument } from '../../core/schemas/terms.schema';
import { UserDocument } from '../../core/schemas/user.schema';
import { AggregatorClass } from '../../event-orchestrator/decorators/aggregator.decorator';
import { Aggregator } from '../../event-orchestrator/interfaces/aggregator.interface';
import { LeagueUpdatedEvent } from '../../resources/partner-resources/leagues/events/league-updated.event';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import { updateUserAggregatePrivacy } from '../../util/privacy.helper';
import { ComputeDetailedStatisticsService } from './compute-detailed-stats.service';

@Injectable()
@AggregatorClass()
export class DetailedStatisticsAggregatorService implements Aggregator {
	constructor(
		@InjectModel(DetailedStatistics.name)
		protected detailedStatsModel: Model<DetailedStatisticsDocument>,
		protected computeDetailedStats: ComputeDetailedStatisticsService,
		protected resourceService: PartnerResourcesService,
	) {}

	async updatedLeague(leagueUpdated: LeagueUpdatedEvent): Promise<number> {
		await this.detailedStatsModel.updateMany(
			{
				resource_id: leagueUpdated.resource.resource_id,
				league: leagueUpdated.newValue.name,
			},
			{
				$set: {
					league_data: leagueUpdated.newValue,
				},
			},
		);

		if (!leagueUpdated.privacyChanged()) {
			return 0;
		}

		const updates = await updateUserAggregatePrivacy(this.detailedStatsModel, {
			resource_id: leagueUpdated.resource.resource_id,
			league: leagueUpdated.newValue.name,
		});

		return updates.reduce((acc, cur) => acc + cur.modifiedCount, 0);
	}

	async termDeleted(term: TermDocument) {
		return await this.computeDetailedStats.reComputeStatsRelatedToTerm(term);
	}
	async termUpdated(oldTerm: TermDocument, term: TermDocument) {
		return await this.computeDetailedStats.reComputeStatsRelatedToTerm(term);
	}

	logger = new Logger(DetailedStatisticsAggregatorService.name);

	async recomputeAllResourceAggregates(resource_id: string) {
		await this.removeAllResourceAggregates(resource_id);
		await this.applyAllReports(resource_id);
	}

	async deleteLeague(resource_id: string, league: string): Promise<number> {
		const deleted = await this.detailedStatsModel.deleteMany({
			resource_id,
			league,
		});

		return deleted.deletedCount;
	}
	async applyReport(
		report: ReportDocument | LeanReportDocument,
		term: TermDocument,
		resource: PartnerResourceDocument,
		curator?: UserDocument,
	) {
		const result = await this.computeDetailedStats.upsertDetailedStats(
			report,
			term,
		);
		this.logger.debug(
			`Updated Detailed Statistics for user ${report.curator_orcid} ${curator?.displayedName} at resource ${resource.resource_name} and league ${report.league}`,
		);

		return result;
	}
	async applyAllReports(resource_id: string) {
		return await this.computeDetailedStats.computeDetailedStats({
			resource_id,
		});
	}
	async removeAllResourceAggregates(resource_id: string) {
		await this.detailedStatsModel.deleteMany({ resource_id });
	}
	async updatedUser(
		event: EntityCreatedEvent<UserDocument> | EntityUpdatedEvent<UserDocument>,
	) {
		let user;
		if (event instanceof EntityCreatedEvent) {
			user = event.instance;
		}
		if (event instanceof EntityUpdatedEvent) {
			user = event.after;
		}

		await this.detailedStatsModel.updateMany(
			{
				curator_orcid: user.orcid_id,
			},
			{
				$set: {
					user: user.toObject(),
				},
			},
		);

		await updateUserAggregatePrivacy(this.detailedStatsModel, {
			curator_orcid: user.orcid_id,
		});
	}
}
