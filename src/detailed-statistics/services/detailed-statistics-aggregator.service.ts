import { Model } from 'mongoose';
import { PrivacyType } from '../../core/enums';
import {
	LeanReportDocument,
	ReportDocument,
} from '../../core/schemas/reports.schema';
import { Aggregator } from '../../event-orchestrator/interfaces/aggregator.interface';
import { InjectModel } from '@nestjs/mongoose';
import {
	DetailedStatistics,
	DetailedStatisticsDocument,
} from '../../core/schemas/statistics/detailed-statistics.schema';
import { ComputeDetailedStatisticsService } from './compute-detailed-stats.service';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import {
	computeAggregatePrivacyField,
	updateUserAggregatePrivacy,
} from '../../util/privacy.helper';
import { Injectable, Logger } from '@nestjs/common';
import { AggregatorClass } from '../../event-orchestrator/decorators/aggregator.decorator';
import { TermDocument } from '../../core/schemas/terms.schema';
import { UserDocument } from '../../core/schemas/user.schema';
import { PartnerResourceDocument } from '../../core/schemas/resource/partner-resource.schema';
import { LeagueUpdatedEvent } from '../../resources/partner-resources/leagues/events/league-updated.event';
import { EntityCreatedEvent, EntityUpdatedEvent } from '../../core/events';

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
			return;
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
