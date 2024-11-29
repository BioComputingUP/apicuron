import { Injectable } from '@nestjs/common';
import { Aggregator } from '../../event-orchestrator/interfaces/aggregator.interface';
import { PrivacyType } from '../../core/enums';
import {
	LeanReportDocument,
	ReportDocument,
} from '../../core/schemas/reports.schema';
import { PartnerResourceDocument } from '../../core/schemas/resource/partner-resource.schema';
import { TermDocument } from '../../core/schemas/terms.schema';
import { UserDocument } from '../../core/schemas/user.schema';
import { AggregatorClass } from '../../event-orchestrator/decorators/aggregator.decorator';
import { ComputeMonthlyStatsService } from './compute-monthly-stats.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
	MonthlyStatistics,
	MonthlyStatisticsDocument,
} from '../../core/schemas/statistics/monthly-statistics.schema';
import { LeagueUpdatedEvent } from '../../resources/partner-resources/leagues/events/league-updated.event';
import { EntityCreatedEvent, EntityUpdatedEvent } from '../../core/events';

@Injectable()
@AggregatorClass()
export class MonthlyStatisticsAggregator implements Aggregator {
	constructor(
		protected computeMonthlyStats: ComputeMonthlyStatsService,
		@InjectModel(MonthlyStatistics.name)
		protected monthlyStatsModel: Model<MonthlyStatisticsDocument>,
	) {}

	async updatedLeague(leagueUpdated: LeagueUpdatedEvent): Promise<number> {
		if (!leagueUpdated.privacyChanged()) {
			return;
		}

		const newPrivacy = leagueUpdated.newValue.visibility;
		const filter = {
			resource_id: leagueUpdated.resource.resource_id,
			league: leagueUpdated.newValue.name,
		};

		const statUpdate = await this.monthlyStatsModel.updateMany(filter, {
			$set: {
				privacy: newPrivacy,
			},
		});

		return statUpdate.modifiedCount;
	}
	async applyReport(
		report: LeanReportDocument | ReportDocument,
		term: TermDocument,
		resource: PartnerResourceDocument,
		curator?: UserDocument,
	) {
		await this.computeMonthlyStats.applyReport(report, term, resource, curator);
	}
	async applyAllReports(resource_id: string) {
		await this.computeMonthlyStats.computeMonthlyStats({ resource_id });
	}
	async removeAllResourceAggregates(resource_id: string) {
		await this.computeMonthlyStats.deleteStats({ resource_id });
	}
	async updatedUser(
		event: EntityCreatedEvent<UserDocument> | EntityUpdatedEvent<UserDocument>,
	) {
		let curator_orcid, privacy;
		if (event instanceof EntityCreatedEvent) {
			curator_orcid = event.instance.orcid_id;
			privacy = event.instance.privacy;
		}
		if (event instanceof EntityUpdatedEvent) {
			curator_orcid = event.after.orcid_id;
			privacy = event.after.privacy;
		}
		return await this.monthlyStatsModel.updateMany(
			{
				curator_orcid,
			},
			{
				$set: {
					privacy,
				},
			},
		);
	}
	async deleteLeague(resource_id: string, league: string): Promise<number> {
		const result = await this.computeMonthlyStats.deleteStats({
			resource_id,
			league,
		});
		return result.deletedCount;
	}
	async recomputeAllResourceAggregates(resource_id: string) {
		await this.computeMonthlyStats.deleteStats({ resource_id });
		await this.computeMonthlyStats.computeMonthlyStats({ resource_id });
	}
	async termUpdated(oldTerm: TermDocument, term: TermDocument) {
		if (oldTerm.score == term.score) {
			return;
		}
		await this.recomputeAllResourceAggregates(term.resource_id);
	}
	async termDeleted(term: TermDocument) {
		return await this.recomputeAllResourceAggregates(term.resource_id);
	}
}
