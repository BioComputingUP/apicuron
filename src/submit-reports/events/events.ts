import { LeanDocument } from 'mongoose';
import { ReportDocument, Report } from '../../core/schemas/reports.schema';
import { ReportDto } from '../../reports/dto/report.dto';

export const postReportInsertManyEvent = 'post.report.insert.many';
export interface IPostReportInsertManyEventPayload {
	reports: ReportDocument[] | LeanDocument<Report>[] | ReportDto[];
}

export const postReportInsertSingleEvent = 'post.report.insert.single';
export interface IPostReportInsertSingleEventPayload {
	report: ReportDocument | LeanDocument<Report> | ReportDto;
}

export const postDeleteAllResourceReports = 'post.reports.deleteall.resource';
export interface IPostDeleteAllResourceReports {
	resource_id: string;
}
