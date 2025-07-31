import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { getEventSubject } from 'src/core/helpers/events.helper';
import {
	UserCreatedEvent,
	UserUpdatedEvent,
} from 'src/core/repositories/user.repository';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { PartnerResource } from '../../core/schemas/resource/partner-resource.schema';
import {
	WeeklyStatistics,
	WeeklyStatisticsDocument,
} from '../../core/schemas/statistics/weekly-statistics.schema';
import { Term, TermDocument } from '../../core/schemas/terms.schema';
import { User } from '../../core/schemas/user.schema';
import { AggregatorClass } from '../../event-orchestrator/decorators/aggregator.decorator';
import { Aggregator } from '../../event-orchestrator/interfaces/aggregator.interface';
import { LeagueUpdatedEvent } from '../../resources/partner-resources/leagues/events/league-updated.event';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import { updateUserAggregatePrivacy } from '../../util/privacy.helper';
import { ComputeWeeklyStatisticsService } from './compute-weekly-statistics.service';

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

	async updatedUser(event: UserCreatedEvent | UserUpdatedEvent) {
		const user: User = getEventSubject(event);
		const filter = {
			curator_orcid: user.orcid_id,
		};
		await this.weeklyStatModel.updateMany(filter, {
			$set: { user },
		});

		await updateUserAggregatePrivacy(this.weeklyStatModel, filter);
	}

	async applyReport(
		report: Report,
		term: Term,
		resource: PartnerResource,
		curator?: User,
	): Promise<void> {
		await this.computeWeeklyStat.updateWithReport(
			report,
			term,
			resource,
			curator,
		);
		this.logger.debug(
			`Updated Weekly Statistics for user ${report.curator_orcid} at resource ${report.resource_id} and league ${report.league}`,
		);
	}

	async applyAllReports(resource_id: string) {
		const reportFilter: FilterQuery<ReportDocument> = { resource_id };

		await this.computeWeeklyStat.computeWeeklyStatistics(reportFilter);
	}

	async removeAllResourceAggregates(resource_id: string) {
		await this.weeklyStatModel.deleteMany({ resource_id });
	}
	async updatedResource(resource: PartnerResource): Promise<void> {
		const res = await this.weeklyStatModel.updateMany(
			{ resource_id: resource.resource_id },
			{ $set: { resource } },
		);
		this.logger.debug(
			`Updated ${res.modifiedCount} weekly statistics for resource ${resource.resource_id}`,
		);
	}
}
