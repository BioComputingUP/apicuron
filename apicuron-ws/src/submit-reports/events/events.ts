import { LeanDocument } from 'mongoose';
import { ReportDocument, Report } from '../../core/schemas/reports.schema';
import { ReportDto } from '../../reports/dto/report.dto';
import { PartnerResource, PartnerResourceDocument } from '../../core/schemas/resource/partner-resource.schema';
import { User, UserDocument } from '../../core/schemas/user.schema';
import { Term, TermDocument } from '../../core/schemas/terms.schema';
import { League } from '../../core/schemas/league/league.schema';

export const ManyReportsSubmittedEvent = 'post.report.insert.many';
export interface IManyReportsSubmittedEventPayload {
	reports: ReportDocument[] | LeanDocument<Report>[] | ReportDto[];
	resources: PartnerResourceDocument[];
	users: UserDocument[];
	terms: TermDocument[];
}

export const ReportSubmittedEvent = 'post.report.insert.single';
export interface IReportSubmittedEventPayload {
	report: Report;
	term: Term;
	resource: PartnerResource;
	user: User;
	league_data: League;
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
