import { Report } from '../../core/schemas/reports.schema';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../core/schemas/resource/partner-resource.schema';
import { User, UserDocument } from '../../core/schemas/user.schema';

export interface ReportHandler {
	handle(report: Report):
		| {
				resource: PartnerResourceDocument;
				report: Report;
				user?: UserDocument | null;
		  }
		| Promise<{
				resource: PartnerResourceDocument;
				report: Report;
				user?: UserDocument | null;
		  }>;
	handleMultiple(reports: Report[]):
		| { reports: Report[]; resources: PartnerResource[]; users: User[] }
		| Promise<{
				reports: Report[];
				resources: PartnerResource[];
				users: User[];
		  }>;
}
