import { Injectable } from '@nestjs/common';
import { PartnerResourceDocument } from '../../core/schemas/resource/partner-resource.schema';
import { UserDocument } from '../../core/schemas/user.schema';
import { PrivacyType } from '../../core/enums';
import { ReportHandler } from '../interfaces/report.handler';
import { ReportDocument } from '../../core/schemas/reports.schema';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import { UsersService } from '../../auth/users/services/users.service';
import { computePrivacyField } from '../../util/privacy.helper';
import { uniq } from 'lodash';
@Injectable()
export class ReportMetaHandler implements ReportHandler {
	constructor(
		protected resourceService: PartnerResourcesService,
		protected usersService: UsersService,
	) {}
	async handle(report: ReportDocument): Promise<{
		resource: PartnerResourceDocument;
		report: ReportDocument;
		user: UserDocument;
	}> {
		const resource = await this.resourceService.get_resource(
			report.resource_id,
		);
		const user = await this.usersService.getByOrcid(report.curator_orcid);
		this.handleIndividualReport(report, resource, user);
		return { report, resource, user };
	}

	async handleMultiple(reports: ReportDocument[]): Promise<{
		reports: ReportDocument[];
		users: UserDocument[];
		resources: PartnerResourceDocument[];
	}> {
		const [resMap, userMap] = await Promise.all([
			this.loadResourcesMap(reports),
			this.loadUsersMap(reports),
		]);

		for (const report of reports) {
			this.handleIndividualReport(
				report,
				resMap.get(report.resource_id),
				userMap.get(report.curator_orcid),
			);
		}

		return {
			reports,
			resources: Array.from(resMap.values()),
			users: Array.from(userMap.values()),
		};
	}

	private async loadResourcesMap(
		reports: ReportDocument[],
	): Promise<Map<string, PartnerResourceDocument>> {
		const resource_ids = uniq(reports.map((r) => r.resource_id));
		const resources = await this.resourceService.get_resources({
			resource_id: { $in: resource_ids },
		});

		const resourceMap = new Map<string, PartnerResourceDocument>(
			resources.map((r) => [r.resource_id, r]),
		);
		return resourceMap;
	}

	private async loadUsersMap(
		reports: ReportDocument[],
	): Promise<Map<string, UserDocument>> {
		const orcid_ids = uniq(reports.map((r) => r.curator_orcid));
		const users = await this.usersService.getUsers({
			orcid_id: { $in: orcid_ids },
		});

		const usersMap = new Map(users.map((u) => [u.orcid_id, u]));
		return usersMap;
	}

	private async handleIndividualReport(
		report: ReportDocument,
		resource: PartnerResourceDocument,
		user: UserDocument,
	) {
		report.league = this.handleLeague(report, resource);
		report.privacy = this.handlePrivacyField(resource, user, report);
		return;
	}

	private handleLeague(
		report: ReportDocument,
		resource: PartnerResourceDocument,
	): string {
		// check if the user belongs to a league
		for (const league of resource.leagues) {
			if (league.defaultMembers.includes(report.curator_orcid)) {
				return league.name;
			}
		}
		// if not, use the default league
		return report.league ? report.league : resource.defaultLeague;
	}

	private handlePrivacyField(
		resource: PartnerResourceDocument,
		user: UserDocument | null,
		report: ReportDocument,
	): PrivacyType {
		return computePrivacyField(resource, user, report);
	}
}
