import { PrivacyType } from '../../core/enums';
import {
	LeanReportDocument,
	ReportDocument,
} from '../../core/schemas/reports.schema';
import { PartnerResourceDocument } from '../../core/schemas/resource/partner-resource.schema';
import { TermDocument } from '../../core/schemas/terms.schema';
import { UserDocument } from '../../core/schemas/user.schema';

export interface Aggregator {
	applyReport(
		report: LeanReportDocument | ReportDocument,
		term: TermDocument,
		resource: PartnerResourceDocument,
		curator?: UserDocument,
	): Promise<any> | any;
	applyAllReports(resource_id: string): Promise<any> | any;
	removeAllResourceAggregates(resource_id: string): Promise<any> | any;
	updateUserPrivacy(
		curator_orcid: string,
		privacy: PrivacyType,
	): Promise<any> | any;
	deleteLeague(resource_id: string, league: string): Promise<number> | number;
	recomputeAllResourceAggregates(resource_id: string): Promise<any> | any;
	termUpdated(oldTerm: TermDocument, term: TermDocument): Promise<any> | any;
	termDeleted(term: TermDocument): Promise<any> | any;
}

export interface AggregatorOptions {
	runBefore?: string[];
}
export interface AggregatorEntry {
	aggregator: Aggregator;
	options: AggregatorOptions;
	name: string;
}
