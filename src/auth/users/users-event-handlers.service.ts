import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../core/schemas/user.schema';
import { OnEvent } from '@nestjs/event-emitter';
import {
	PRE_REPORT_INSERT,
	PRE_REPORT_INSERT_MANY,
} from '../../reports/constants';
import { ReportDocument } from '../../core/schemas/reports.schema';
import { PrivacyType } from '../../core/enums';

@Injectable()
export class UsersEventHandlers {
	constructor(
		@InjectModel(User.name) protected userModel: Model<UserDocument>,
	) {}

	logger = new Logger(UsersEventHandlers.name);

	@OnEvent(PRE_REPORT_INSERT, { async: true, promisify: true })
	async preReportInsert(report: ReportDocument) {
		const user = await this.userModel.findOne(
			{
				orcid_id: report.curator_orcid,
			},
			{ privacy: 1, resource_settings: 1 },
		);

		const { privacy } = user.getResourceSettings(report.resource_id);

		report.privacy = privacy;

		return;
	}

	@OnEvent(PRE_REPORT_INSERT_MANY, { async: true, promisify: true })
	async preReportInsertMany(reports: ReportDocument[]) {
		const orcidIdSet = new Set<string>();
		reports.map((report) => orcidIdSet.add(report.curator_orcid));
		const orcidIds = Array.from(orcidIdSet);

		const users = await this.userModel.find(
			{
				orcid_id: { $in: orcidIds },
			},
			{ privacy: 1, resource_settings: 1 },
		);

		const userMap = new Map<string, UserDocument>();
		users.forEach((user) => {
			userMap.set(user.orcid_id, user);
		});

		for (const report of reports) {
			const user = userMap.get(report.curator_orcid) ?? null;
			if (!user) {
				report.privacy = PrivacyType.private;
			} else {
				const { privacy } = user.getResourceSettings(report.resource_id);
				report.privacy = privacy;
			}
		}

		return reports;
	}
}
