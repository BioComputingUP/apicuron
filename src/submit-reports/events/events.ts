import { LeanDocument } from 'mongoose';
import { ReportDocument, Report } from '../../core/schemas/reports.schema';
import { ReportDto } from '../../reports/dto/report.dto';

export const ManyReportsSubmittedEvent = 'post.report.insert.many';
export interface IManyReportsSubmittedEventPayload {
	reports: ReportDocument[] | LeanDocument<Report>[] | ReportDto[];
}

export const ReportSubmittedEvent = 'post.report.insert.single';
export interface IReportSubmittedEventPayload {
	report: ReportDocument | LeanDocument<Report> | ReportDto;
}

export const AllResourceReportsDeletedEvent = 'post.reports.deleteall.resource';
export interface IAllResourceReportsDeletedEventPayload {
	resource_id: string;
}

export class BulkSubmissionEvent {
	constructor(
		public readonly submitter_orcid: string,
		public readonly resource_ids: string[],
	) {}
}
