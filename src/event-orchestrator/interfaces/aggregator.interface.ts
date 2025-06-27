import { PrivacyType } from '../../core/enums';
import { EntityCreatedEvent, EntityUpdatedEvent } from '../../core/events';
import {
	LeanReportDocument,
	ReportDocument,
} from '../../core/schemas/reports.schema';
import { PartnerResourceDocument } from '../../core/schemas/resource/partner-resource.schema';
import {
	LeanTermDocument,
	TermDocument,
} from '../../core/schemas/terms.schema';
import { UserDocument } from '../../core/schemas/user.schema';
import { PartnerResourceUpdatedEvent } from '../../resources/partner-resources/events/resource-updated.event';
import { LeagueUpdatedEvent } from '../../resources/partner-resources/leagues/events/league-updated.event';

export interface Aggregator {
	applyReport(
		report: LeanReportDocument | ReportDocument,
		term: TermDocument,
		resource: PartnerResourceDocument,
		curator?: UserDocument,
	): Promise<any> | any;
	applyAllReports(resource_id: string): Promise<any> | any;
	removeAllResourceAggregates(resource_id: string): Promise<any> | any;
	updatedUser(
		event: EntityCreatedEvent<UserDocument> | EntityUpdatedEvent<UserDocument>,
	): Promise<any> | any;
	deleteLeague(
		resource_id: string,
		league: string,
	): Promise<number> | number | any;
	updatedLeague(
		leagueUpdated: LeagueUpdatedEvent,
	): Promise<number> | number | any;
	recomputeAllResourceAggregates(resource_id: string): Promise<any> | any;
	termUpdated(oldTerm: TermDocument, term: TermDocument): Promise<any> | any;
	termDeleted(
		term_name: string,
		resource_id: string,
		league_name: string,
	): Promise<void>;

	updatedResource?(event: PartnerResourceUpdatedEvent): Promise<any> | any;
}

export interface AggregatorOptions {
	runBefore?: string[];
}
export interface AggregatorEntry {
	aggregator: Aggregator;
	options: AggregatorOptions;
	name: string;
}
