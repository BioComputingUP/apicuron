import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
	LeanReportDocument,
	Report,
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
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
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
		this.registryService.applyReportToCuratorRegistry(
			report,
			resource || report.resource,
			curator || (report.user as UserDocument),
		);
		this.logger.debug(
			`Applied report to curator registry for resource ${resource.resource_id} and term ${term.activity_term}`,
		);
		return;
	}

	applyAllReports(resource_id: string) {
		this.registryService.recomputeAllEntries();
	}
	updatedUser(
		event: EntityCreatedEvent<UserDocument> | EntityUpdatedEvent<UserDocument>,
	) {
		if (event instanceof EntityCreatedEvent) {
			this.registryService.createUserEntry(
				event.instance.orcid_id,
				event.instance,
			);
		} else if (event instanceof EntityUpdatedEvent) {
			this.registryService.updateUserData(event.after.orcid_id, event.after);
		}
	}
	async removeAllResourceAggregates(resource_id: string) {
		const resultCount = await this.registryService.deleteAllEntriesOfResource(
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
		this.recomputeAllResourceAggregates(term.resource_id);
		return;
	}
}
