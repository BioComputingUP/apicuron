import { Injectable, Logger } from '@nestjs/common';
import {
	LeanReportDocument,
	ReportDocument,
} from 'src/core/schemas/reports.schema';
import { TermDocument } from 'src/core/schemas/terms.schema';
import { UserDocument } from 'src/core/schemas/user.schema';
import { AggregatorClass } from 'src/event-orchestrator/decorators/aggregator.decorator';
import { Aggregator } from 'src/event-orchestrator/interfaces/aggregator.interface';
import { LeagueUpdatedEvent } from 'src/resources/partner-resources/leagues/events/league-updated.event';

import { EntityCreatedEvent, EntityUpdatedEvent } from 'src/core/events';
import { UserRepository } from 'src/core/repositories/user.repository';

import { PartnerResourceDocument } from 'src/core/schemas';
import { CuratorRegistryService } from '../curator-registry.service';

@Injectable()
@AggregatorClass()
export class CuratorRegistryAggregatorService implements Aggregator {
	constructor(
		protected registryService: CuratorRegistryService,
		protected userRep: UserRepository,
	) {}
	private logger = new Logger(CuratorRegistryAggregatorService.name);

	async applyReport(
		report: LeanReportDocument | ReportDocument,
		term: TermDocument,
		resource: PartnerResourceDocument,
		curator?: UserDocument,
	) {
		const user = curator || this.userRep.newDocument(report.user);

		await this.registryService.addContribution(
			report.curator_orcid,
			report.resource_id,
			report.league,
			user,
			resource || report.resource,
			report.league_data,
		);
		this.logger.debug(
			`Applied report to curator registry for resource ${resource.resource_id} and term ${term.activity_term}`,
		);
		return;
	}

	async applyAllReports(resource_id: string) {
		await this.registryService.recomputeResourceAggregate(resource_id);
	}
	async updatedUser(
		event: EntityCreatedEvent<UserDocument> | EntityUpdatedEvent<UserDocument>,
	) {
		if (event instanceof EntityCreatedEvent) {
			await this.registryService.createNewEntry(
				event.instance.orcid_id,
				event.instance,
			);
		} else if (event instanceof EntityUpdatedEvent) {
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
	}
	async recomputeAllResourceAggregates(resource_id: string) {
		await this.removeAllResourceAggregates(resource_id);
		await this.applyAllReports(resource_id);
	}
	deleteLeague(resource_id: string, league: string): Promise<number> | number {
		return this.registryService.deleteLeague(resource_id, league);
	}
	termUpdated(_oldTerm: TermDocument, _term: TermDocument) {
		// Curator registry is independent of terms, all contributions are aggregated equally
		return;
	}
	async termDeleted(
		term_name: string,
		resource_id: string,
		league_name: string,
	) {
		await this.registryService.recomputeResourceAggregate(resource_id);
		return;
	}
}
