import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { get_user_from_event } from 'src/util/aggregator.helper';
import { EntityCreatedEvent, EntityUpdatedEvent } from '../../core/events';
import {
	LeanReportDocument,
	ReportDocument,
} from '../../core/schemas/reports.schema';
import { PartnerResourceDocument } from '../../core/schemas/resource/partner-resource.schema';
import {
	MonthlyStatistics,
	MonthlyStatisticsDocument,
} from '../../core/schemas/statistics/monthly-statistics.schema';
import { TermDocument } from '../../core/schemas/terms.schema';
import { UserDocument } from '../../core/schemas/user.schema';
import { AggregatorClass } from '../../event-orchestrator/decorators/aggregator.decorator';
import { Aggregator } from '../../event-orchestrator/interfaces/aggregator.interface';
import { LeagueUpdatedEvent } from '../../resources/partner-resources/leagues/events/league-updated.event';
import { updateUserAggregatePrivacy } from '../../util/privacy.helper';
import { ComputeMonthlyStatsService } from './compute-monthly-stats.service';

@Injectable()
@AggregatorClass()
export class MonthlyStatisticsAggregator implements Aggregator {
	constructor(
		protected computeMonthlyStats: ComputeMonthlyStatsService,
		@InjectModel(MonthlyStatistics.name)
		protected monthlyStatsModel: Model<MonthlyStatisticsDocument>,
	) {}

	async updatedLeague(leagueUpdated: LeagueUpdatedEvent): Promise<number> {
		const filter = {
			resource_id: leagueUpdated.resource.resource_id,
			league: leagueUpdated.newValue.name,
		};
		const update = await this.monthlyStatsModel.updateMany(filter, {
			$set: {
				league_data: leagueUpdated.newValue,
			},
		});

		if (!leagueUpdated.privacyChanged()) {
			return update.modifiedCount;
		}

		const updates = await updateUserAggregatePrivacy(
			this.monthlyStatsModel,
			filter,
		);

		return (
			updates.reduce((acc, cur) => acc + cur.modifiedCount, 0) +
			update.modifiedCount
		);
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
		const user = get_user_from_event(event);
		await this.monthlyStatsModel.updateMany(
			{
				curator_orcid: user.orcid_id,
			},
			{
				$set: {
					user,
				},
			},
		);

		await updateUserAggregatePrivacy(this.monthlyStatsModel, {
			curator_orcid: user.orcid_id,
		});
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
