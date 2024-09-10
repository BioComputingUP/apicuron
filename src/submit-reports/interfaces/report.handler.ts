import { ReportDocument } from '../../core/schemas/reports.schema';
import { PartnerResourceDocument } from '../../core/schemas/resource/partner-resource.schema';
import { UserDocument } from '../../core/schemas/user.schema';

export interface ReportHandler {
	handle(report: ReportDocument):
		| {
				resource: PartnerResourceDocument;
				report: ReportDocument;
				user: UserDocument;
		  }
		| Promise<{
				resource: PartnerResourceDocument;
				report: ReportDocument;
				user: UserDocument;
		  }>;
	handleMultiple(
		reports: ReportDocument[],
	):
		| { reports: ReportDocument[]; resources: any[]; users: any[] }
		| Promise<{ reports: ReportDocument[]; resources: any[]; users: any[] }>;
}
