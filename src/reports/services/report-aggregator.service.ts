import { Injectable } from '@nestjs/common';
import { AggregatorClass } from '../../event-orchestrator/decorators/aggregator.decorator';
import { Aggregator } from '../../event-orchestrator/interfaces/aggregator.interface';
import { EntityCreatedEvent, EntityUpdatedEvent } from '../../core/events';
import { TermDocument, PartnerResourceDocument } from '../../core/schemas';
import {
	LeanReportDocument,
	ReportDocument,
} from '../../core/schemas/reports.schema';
import { UserDocument } from '../../core/schemas/user.schema';
import { LeagueUpdatedEvent } from '../../resources/partner-resources/leagues/events/league-updated.event';

@Injectable()
@AggregatorClass()
export class ReportAggregatorService implements Aggregator {
	// constructor() {}
	applyReport(
		report: LeanReportDocument | ReportDocument,
		term: TermDocument,
		resource: PartnerResourceDocument,
		curator?: UserDocument,
	) {}
	applyAllReports(resource_id: string) {}
	removeAllResourceAggregates(resource_id: string) {}
	updatedUser(
		event: EntityCreatedEvent<UserDocument> | EntityUpdatedEvent<UserDocument>,
	) {
		throw new Error('Method not implemented.');
	}
	deleteLeague(resource_id: string, league: string) {}
	updatedLeague(leagueUpdated: LeagueUpdatedEvent) {}
	recomputeAllResourceAggregates(resource_id: string) {}
	termUpdated(oldTerm: TermDocument, term: TermDocument) {}
	termDeleted(term: TermDocument) {}
}
