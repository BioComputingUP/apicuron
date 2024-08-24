import { PrivacyType } from '../../core/enums';
import {
	LeanReportDocument,
	ReportDocument,
} from '../../core/schemas/reports.schema';

export interface Aggregator {
	applyReport(report: LeanReportDocument | ReportDocument): Promise<any> | any;
	applyAllReports(resource_id: string): Promise<any> | any;
	removeAllResourceAggregates(resource_id: string): Promise<any> | any;
	updateUserPrivacy(
		curator_orcid: string,
		privacy: PrivacyType,
	): Promise<any> | any;
	deleteLeague(resource_id: string, league: string): Promise<number> | number;
	recomputeAllResourceAggregates(resource_id: string): Promise<any> | any;
}

export interface AggregatorOptions {
	runBefore?: string[];
}
export interface AggregatorEntry {
	aggregator: Aggregator;
	options: AggregatorOptions;
	name: string;
}
