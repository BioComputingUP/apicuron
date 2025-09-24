import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Report, ReportModel } from 'src/core/schemas/reports.schema';
import { Term, TermDocument } from 'src/core/schemas/terms.schema';
import { User } from 'src/core/schemas/user.schema';
import { AggregatorClass } from 'src/event-orchestrator/decorators/aggregator.decorator';
import { Aggregator } from 'src/event-orchestrator/interfaces/aggregator.interface';
import { LeagueUpdatedEvent } from 'src/resources/partner-resources/leagues/events/league-updated.event';

import {
	UserCreatedEvent,
	UserRepository,
	UserUpdatedEvent
} from 'src/core/repositories/user.repository';

import { PartnerResource, PartnerResourceDocument } from 'src/core/schemas';
import { CuratorRegistryService } from '../curator-registry.service';

@Injectable()
@AggregatorClass()
export class CuratorRegistryAggregatorService implements Aggregator {
	constructor(
		@InjectModel(Report.name) protected reportModel: ReportModel,
		protected registryService: CuratorRegistryService,
		protected userRep: UserRepository,
	) {}
	private logger = new Logger(CuratorRegistryAggregatorService.name);

	async applyReport(
		report: Report,
		_term: Term,
		resource: PartnerResource,
		curator?: User,
	) {
		const user = curator ?? report.user ?? undefined;

		await this.registryService.addContribution(
			report.curator_orcid,
			report.resource_id,
			report.league,
			user,
			resource || report.resource,
			report.league_data,
		);
		this.logger.debug(
			`Applied report to curator registry for resource ${resource.resource_id} and term ${report.term.activity_term}`,
		);
		return;
	}

	async applyAllReports(resource_id: string) {
		await this.registryService.recomputeResourceAggregate(resource_id);
	}
	async updatedUser(event: UserCreatedEvent | UserUpdatedEvent) {
		if (event instanceof UserCreatedEvent) {
			await this.registryService.createNewEntry(
				event.instance.orcid_id,
				event.instance,
			);
		} else if (event instanceof UserUpdatedEvent) {
			await this.registryService.updateUserData(
				event.after.orcid_id,
				event.after,
			);
		}
	}
	async removeAllResourceAggregates(resource_id: string) {
		const resultCount = await this.registryService.clearEntriesForResource(
			resource_id,
		);
		this.logger.debug(`Deleted ${resultCount} statistics for ${resource_id}`);
	}

	async updatedLeague(leagueUpdated: LeagueUpdatedEvent) {
		const count = await this.registryService.updateLeague(
			leagueUpdated.newValue,
		);
		this.logger.debug(`Updated League for ${count} curators`);
		return count;
	}
	async recomputeAllResourceAggregates(resource_id: string) {
		await this.registryService.recomputeResourceAggregate(resource_id);
	}
	deleteLeague(resource_id: string, league: string): Promise<number> | number {
		return this.registryService.deleteLeague(resource_id, league);
	}
	termUpdated(_oldTerm: TermDocument, _term: TermDocument) {
		// Curator registry is independent of terms, all contributions are aggregated equally
		return;
	}
	async termDeleted(term: TermDocument) {
		await this.registryService.recomputeResourceAggregate(term.resource_id);
		return;
	}
	async updatedResource(resource: PartnerResourceDocument): Promise<void> {
		await this.registryService.updateResource(resource);
	}
}
