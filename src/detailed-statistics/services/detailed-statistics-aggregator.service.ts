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
import { computeAggregatePrivacyField } from '../../util/privacy.helper';
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
		if (!leagueUpdated.privacyChanged()) {
			return;
		}

		const newPrivacy = leagueUpdated.newValue.visibility;
		const filter = {
			resource_id: leagueUpdated.resource.resource_id,
			league: leagueUpdated.newValue.name,
		};

		const statUpdate = await this.detailedStatsModel.updateMany(filter, {
			$set: {
				privacy: newPrivacy,
			},
		});

		return statUpdate.modifiedCount;
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
		let curator_orcid, privacy, user;
		if (event instanceof EntityCreatedEvent) {
			curator_orcid = event.instance.orcid_id;
			privacy = event.instance.privacy;
			user = event.instance;
		}
		if (event instanceof EntityUpdatedEvent) {
			curator_orcid = event.after.orcid_id;
			privacy = event.after.privacy;
			user = event.after;
		}
		await this.detailedStatsModel.updateMany(
			{
				curator_orcid,
				privacy: PrivacyType.public,
			},
			{
				$set: { privacy, user },
			},
		);

		const resource_ids = await this.detailedStatsModel.distinct('resource_id', {
			curator_orcid,
		});
		const resources = await this.resourceService.get_resources({
			resource_id: { $in: resource_ids },
		});
		const resourceLeagues = resources
			.map((resource) => this.resourceService.getResourceLeagues(resource))
			.flat();
		const updates$ = [];
		for (const [resource, league] of resourceLeagues) {
			const update$ = this.detailedStatsModel.updateMany(
				{
					resource_id: resource.resource_id,
					league: league.name,
					curator_orcid,
				},
				{
					privacy: computeAggregatePrivacyField(
						{ privacy: league.visibility },
						{ privacy },
					),
				},
			);

			updates$.push(update$);
		}

		await Promise.all(updates$);
	}
}
