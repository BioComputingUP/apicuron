import { Injectable, Logger } from '@nestjs/common';
import { Aggregator } from '../../event-orchestrator/interfaces/aggregator.interface';
import { Model } from 'mongoose';
import { ReportDocument } from '../../core/schemas/reports.schema';
import { ComputeStatisticsService } from '../compute-statistics/compute-statistics.service';
import { InjectModel } from '@nestjs/mongoose';
import {
	Statistics,
	StatisticsDocument,
} from '../../core/schemas/statistics.schema';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import { AggregatorClass } from '../../event-orchestrator/decorators/aggregator.decorator';
import { PartnerResourceDocument } from '../../core/schemas/resource/partner-resource.schema';
import { UserDocument } from '../../core/schemas/user.schema';
import { TermDocument } from '../../core/schemas/terms.schema';
import { LeagueUpdatedEvent } from '../../resources/partner-resources/leagues/events/league-updated.event';
import { EntityCreatedEvent, EntityUpdatedEvent } from '../../core/events';
import { updateUserAggregatePrivacy } from '../../util/privacy.helper';
@Injectable()
@AggregatorClass()
export class StatisticsAggregator implements Aggregator {
	constructor(
		@InjectModel(Statistics.name)
		protected statModel: Model<StatisticsDocument>,
		protected resourceService: PartnerResourcesService,
		protected computeStats: ComputeStatisticsService,
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

		const statUpdate = await this.statModel.updateMany(filter, {
			$set: {
				privacy: newPrivacy,
			},
		});

		return statUpdate.modifiedCount;
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
	async deleteLeague(resource_id: string, league: string): Promise<number> {
		const deleted = await this.statModel.deleteMany({
			resource_id,
			league,
		});

		return deleted.deletedCount;
	}

	async recomputeAllResourceAggregates(resource_id: string) {
		await this.removeAllResourceAggregates(resource_id);
		await this.applyAllReports(resource_id);
	}

	logger = new Logger(StatisticsAggregator.name);

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
		this.logger.log(
			`Handling Update user stat privacy event in statistics service ${user.orcid_id} ${user.privacy} `,
		);

		await this.statModel.updateMany(
			{
				curator_orcid: user.orcid_id,
			},
			{
				$set: {
					user: user.toObject(),
				},
			},
		);
		await updateUserAggregatePrivacy(this.statModel, {
			curator_orcid: user.orcid_id,
		});
		return;
	}

	async applyReport(
		report: ReportDocument,
		term: TermDocument,
		resource: PartnerResourceDocument,
		user?: UserDocument,
	) {
		return await this.computeStats.incrementStatByReport(
			report,
			term,
			resource,
			user,
		);
	}
	async applyAllReports(resource_id: string) {
		await this.computeStats.computeStatistics({ resource_id });
	}
	async removeAllResourceAggregates(resource_id: string) {
		const result = await this.statModel.deleteMany({
			resource_id,
		});
		this.logger.debug(
			`Deleted ${result.deletedCount} statistics for ${resource_id}`,
		);
	}
}
