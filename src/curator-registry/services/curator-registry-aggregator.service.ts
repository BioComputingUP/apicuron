import { Injectable, Logger } from '@nestjs/common';
import { AggregatorClass } from 'src/event-orchestrator/decorators/aggregator.decorator';
import { Aggregator } from 'src/event-orchestrator/interfaces/aggregator.interface';
import {
	ReportDocument,
	LeanReportDocument,
} from 'src/core/schemas/reports.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { TermDocument } from 'src/core/schemas/terms.schema';
import { User, UserDocument } from 'src/core/schemas/user.schema';
import { LeagueUpdatedEvent } from 'src/resources/partner-resources/leagues/events/league-updated.event';
import { Report } from 'src/core/schemas/reports.schema';

import { EntityCreatedEvent, EntityUpdatedEvent } from 'src/core/events';
import { UserRepository } from 'src/core/repositories/user.repository';

import { CuratorRegistryService } from '../curator-registry.service';
import { PartnerResource, PartnerResourceDocument } from 'src/core/schemas';

@Injectable()
@AggregatorClass()
export class CuratorRegistryAggregatorService implements Aggregator {
	constructor(
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
		protected registryService: CuratorRegistryService,
		protected userRep: UserRepository,
	) {}
	private logger = new Logger(CuratorRegistryAggregatorService.name);

	async applyReport(
		report: LeanReportDocument | ReportDocument,
		term: TermDocument,
		resource: PartnerResourceDocument,
		curator?: UserDocument | null,
	) {
		// check registry for existing curator
		const curatorEntry = await this.registryService.getCuratorEntry(
			report.curator_orcid,
		);

		const leagueData =
			report.league_data ?? (await resource.getLeague(report.league));

		if (!leagueData) {
			throw new Error(
				`${this.constructor.name} League data not found for report with resource_id ${report.resource_id} and league ${report.league}`,
			);
		}

		// if curator has no entry, insert them with the resource, and add league to groups
		if (curatorEntry === null) {
			await this.registryService.addEntry(
				report.curator_orcid,
				report.resource as PartnerResource,
				leagueData,
				report.user as User,
			);
			this.logger.debug(
				`New curator entry created for ${report.curator_orcid}`,
			);
			return;
		}
		// if curator has entry
		// if resource not in their entry, add it
		if (
			curatorEntry.contributed_to.find(
				(entry) => entry.resource_id === resource.resource_id,
			) === undefined
		) {
			await this.registryService.addResourceToUser(
				report.curator_orcid,
				report.resource as PartnerResource,
				leagueData,
			);
			this.logger.debug(
				`Resource ${report.resource_id} added to curator entry with orcid ${report.curator_orcid}`,
			);
			return;
		}
		// if league not inside the resource entry add it
		const userResource = curatorEntry.contributed_to.find(
			(entry) => entry.resource_id === resource.resource_id,
		);
		const userHasContributedToLeague = userResource && userResource.groups.find(
			(league) => league.name === leagueData.name,
		);
		if (!userHasContributedToLeague) {
			this.registryService.addLeagueToUser(
				report.curator_orcid,
				resource.resource_id,
				leagueData,
			);
			this.logger.debug(
				`League ${report.league} under ${report.resource_id} added to curator entry`,
			);
		}
		return;
	}

	applyAllReports(resource_id: string) {
		this.registryService.recomputeAllEntries();
	}
	updatedUser(
		event: EntityCreatedEvent<UserDocument> | EntityUpdatedEvent<UserDocument>,
	) {
		const user =
			event instanceof EntityCreatedEvent ? event.instance : event.after;
		// this will update user if they already have an entry, create new entry if not
		this.registryService.upsertUser(user);
		return;
	}

	async removeAllResourceAggregates(resource_id: string) {
		const resultCount = await this.registryService.removeAllEntries(
			resource_id,
		);
		this.logger.debug(`Deleted ${resultCount} statistics for ${resource_id}`);
	}

	async updatedLeague(leagueUpdated: LeagueUpdatedEvent) {
		// Change privacy for changed leagues.
		if (!leagueUpdated.privacyChanged()) {
			return;
		}
		this.logger.debug('Updating league privacy');
		const count = await this.registryService.updateLeague(
			leagueUpdated.newValue,
		);
		this.logger.debug(`Updated League privacy for ${count} curators`);
	}
	async recomputeAllResourceAggregates(resource_id: string) {
		await this.removeAllResourceAggregates(resource_id);
		await this.applyAllReports(resource_id);
	}
	deleteLeague(resource_id: string, league: string): Promise<number> | number {
		// Do nothing
		return 0;
	}
	termUpdated(oldTerm: TermDocument, term: TermDocument) {
		//shouldn't affect
		return;
	}
	termDeleted(term: TermDocument) {
		// TODO: rediscuss this
		// Probably recalulating all resource aggregates is better than doing an aggregation across all 3 collections (terms, reports, registry)
		// Especially since the old reports with the term would be deleted when this triggers
		this.recomputeAllResourceAggregates(term.resource_id);
		return;
	}
}
