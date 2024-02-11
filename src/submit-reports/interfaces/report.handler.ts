import { ReportDocument } from '../../core/schemas/reports.schema';

export interface ReportHandler {
	handle(report: ReportDocument): ReportDocument | Promise<ReportDocument>;
	handleMultiple(
		reports: ReportDocument[],
	): ReportDocument[] | Promise<ReportDocument[]>;
}
