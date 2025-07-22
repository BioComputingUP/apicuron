import { Injectable } from '@nestjs/common';
import { uniq } from 'lodash';
import { assertNotNull } from 'src/util/type-assertion.helper';
import { UsersService } from '../../auth/users/services/users.service';
import { PrivacyType } from '../../core/enums';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { PartnerResourceDocument } from '../../core/schemas/resource/partner-resource.schema';
import { User, UserDocument } from '../../core/schemas/user.schema';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import { computePrivacyField } from '../../util/privacy.helper';
import { ReportHandler } from '../interfaces/report.handler';
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

	async handleMultiple(reports: Report[]): Promise<{
		reports: Report[];
		users: User[];
		resources: PartnerResourceDocument[];
	}> {
		const [resMap, userMap] = await Promise.all([
			this.loadResourcesMap(reports),
			this.loadUsersMap(reports),
		]);

		for (const report of reports) {
			const resource = resMap.get(report.resource_id);
			assertNotNull(
				resource,
				`Resource with ID ${report.resource_id} not found for report ${report}`,
			);
			const user = userMap.get(report.curator_orcid);
			assertNotNull(
				user,
				`User with ORCID ${report.curator_orcid} not found for report ${report}`,
			);

			this.handleIndividualReport(report, resource, user);
		}

		return {
			reports,
			resources: Array.from(resMap.values()),
			users: Array.from(userMap.values()),
		};
	}

	private async loadResourcesMap(
		reports: Report[],
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

	private async loadUsersMap(reports: Report[]): Promise<Map<string, User>> {
		const orcid_ids = uniq(reports.map((r) => r.curator_orcid));
		const users = await this.usersService.getUsers({
			orcid_id: { $in: orcid_ids },
		});

		const usersMap = new Map(users.map((u) => [u.orcid_id, u]));
		return usersMap;
	}

	private async handleIndividualReport(
		report: Report,
		resource: PartnerResourceDocument,
		user: User,
	) {
		report.league = this.handleLeague(report, resource);
		report.privacy = this.handlePrivacyField(resource, user, report);
		return;
	}

	private handleLeague(
		report: Report,
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
		user: User | null,
		report: Report,
	): PrivacyType {
		return computePrivacyField(resource, user, report);
	}
}
