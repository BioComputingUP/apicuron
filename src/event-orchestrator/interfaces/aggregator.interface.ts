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
}
