import { Injectable, Logger } from '@nestjs/common';
import { Aggregator } from '../../event-orchestrator/interfaces/aggregator.interface';
import { Document, FilterQuery, Model, Types } from 'mongoose';
import {
	Report,
	LeanReportDocument,
	ReportDocument,
} from '../../core/schemas/reports.schema';
import { InjectModel } from '@nestjs/mongoose';
import {
	WeeklyStatistics,
	WeeklyStatisticsDocument,
} from '../../core/schemas/statistics/weekly-statistics.schema';
import { ComputeWeeklyStatisticsService } from './compute-weekly-statistics.service';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import { updateUserAggregatePrivacy } from '../../util/privacy.helper';
import { AggregatorClass } from '../../event-orchestrator/decorators/aggregator.decorator';
import { TermDocument } from '../../core/schemas/terms.schema';
import { PartnerResourceDocument } from '../../core/schemas/resource/partner-resource.schema';
import { UserDocument } from '../../core/schemas/user.schema';
import { LeagueUpdatedEvent } from '../../resources/partner-resources/leagues/events/league-updated.event';
import { EntityCreatedEvent, EntityUpdatedEvent } from '../../core/events';

@Injectable()
@AggregatorClass()
export class WeeklyStatisticsAggregatorService implements Aggregator {
	constructor(
		@InjectModel(WeeklyStatistics.name)
		protected weeklyStatModel: Model<WeeklyStatisticsDocument>,
		protected resourceService: PartnerResourcesService,
		protected computeWeeklyStat: ComputeWeeklyStatisticsService,
	) {}

	async updatedLeague(leagueUpdated: LeagueUpdatedEvent): Promise<number> {
		const filter = {
			resource_id: leagueUpdated.resource.resource_id,
			league: leagueUpdated.newValue.name,
		};
		const statUpdate = await this.weeklyStatModel.updateMany(filter, {
			$set: {
				league_data: leagueUpdated.newValue,
			},
		});

		if (!leagueUpdated.privacyChanged()) {
			return statUpdate.modifiedCount;
		}

		const updates = await updateUserAggregatePrivacy(
			this.weeklyStatModel,
			filter,
		);

		return (
			updates.reduce((acc, cur) => acc + cur.modifiedCount, 0) +
			statUpdate.modifiedCount
		);
	}

	async termDeleted(term_name: string, resource_id: string) {
		return await this.recomputeAllResourceAggregates(resource_id);
	}
	async termUpdated(oldTerm: TermDocument, term: TermDocument) {
		if (oldTerm.score == term.score) {
			return;
		}
		return await this.recomputeAllResourceAggregates(term.resource_id);
	}

	logger = new Logger(WeeklyStatisticsAggregatorService.name);

	async recomputeAllResourceAggregates(resource_id: string) {
		await this.removeAllResourceAggregates(resource_id);
		await this.applyAllReports(resource_id);
	}

	async deleteLeague(resource_id: string, league: string): Promise<number> {
		const deleted = await this.weeklyStatModel.deleteMany({
			resource_id,
			league,
		});

		return deleted.deletedCount;
	}

	async updatedUser(
		event: EntityCreatedEvent<UserDocument> | EntityUpdatedEvent<UserDocument>,
	) {
		let user: UserDocument;
		if (event instanceof EntityCreatedEvent) {
			user = event.instance;
		}
		if (event instanceof EntityUpdatedEvent) {
			user = event.after;
		}
		const filter = {
			curator_orcid: user.orcid_id,
		};
		await this.weeklyStatModel.updateMany(filter, {
			$set: { user },
		});

		await updateUserAggregatePrivacy(this.weeklyStatModel, filter);
	}

	async applyReport(
		report:
			| (Document<unknown, any, Report> & Report & { _id: Types.ObjectId })
			| LeanReportDocument,
		term: TermDocument,
		resource: PartnerResourceDocument,
		curator?: UserDocument,
	) {
		const result = await this.computeWeeklyStat.updateWithReport(
			report,
			term,
			resource,
			curator,
		);
		this.logger.debug(
			`Updated Weekly Statistics for user ${report.curator_orcid} at resource ${report.resource_id} and league ${report.league}`,
		);
		return result;
	}

	async applyAllReports(resource_id: string) {
		const reportFilter: FilterQuery<ReportDocument> = { resource_id };

		await this.computeWeeklyStat.computeWeeklyStatistics(reportFilter);
	}

	async removeAllResourceAggregates(resource_id: string) {
		await this.weeklyStatModel.deleteMany({ resource_id });
	}
}
