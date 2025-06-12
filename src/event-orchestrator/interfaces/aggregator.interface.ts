import { EntityCreatedEvent, EntityUpdatedEvent } from '../../core/events';
import {
	LeanReportDocument,
	ReportDocument,
} from '../../core/schemas/reports.schema';
import { PartnerResourceDocument } from '../../core/schemas/resource/partner-resource.schema';
import { TermDocument } from '../../core/schemas/terms.schema';
import { UserDocument } from '../../core/schemas/user.schema';
import { PartnerResourceUpdatedEvent } from '../../resources/partner-resources/events/resource-updated.event';
import { LeagueUpdatedEvent } from '../../resources/partner-resources/leagues/events/league-updated.event';

export interface Aggregator {
	applyReport(
		report: LeanReportDocument | ReportDocument,
		term: TermDocument,
		resource: PartnerResourceDocument,
		curator?: UserDocument,
	): Promise<void>;
	applyAllReports(resource_id: string): Promise<void> | void;
	removeAllResourceAggregates(resource_id: string): Promise<void> | void;
	updatedUser(
		event: EntityCreatedEvent<UserDocument> | EntityUpdatedEvent<UserDocument>,
	): Promise<void> | void;
	deleteLeague(resource_id: string, league: string): Promise<number> | number;
	updatedLeague(leagueUpdated: LeagueUpdatedEvent): Promise<number> | number;
	recomputeAllResourceAggregates(resource_id: string): Promise<void> | void;
	termUpdated(oldTerm: TermDocument, term: TermDocument): Promise<void> | void;
	termDeleted(term: TermDocument): Promise<void> | void;

	updatedResource?(event: PartnerResourceUpdatedEvent): Promise<void> | void;
}

export interface AggregatorOptions {
	runBefore?: string[];
}
export interface AggregatorEntry {
	aggregator: Aggregator;
	options: AggregatorOptions;
	name: string;
}
