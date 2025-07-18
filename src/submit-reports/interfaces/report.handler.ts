import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { PartnerResourceDocument } from '../../core/schemas/resource/partner-resource.schema';
import { UserDocument } from '../../core/schemas/user.schema';

export interface ReportHandler {
	handle(report: Report):
		| {
				resource: PartnerResourceDocument;
				report: Report;
				user: UserDocument;
		  }
		| Promise<{
				resource: PartnerResourceDocument;
				report: Report;
				user: UserDocument;
		  }>;
	handleMultiple(
		reports: Report[],
	):
		| { reports: Report[]; resources: any[]; users: any[] }
		| Promise<{ reports: Report[]; resources: any[]; users: any[] }>;
}
