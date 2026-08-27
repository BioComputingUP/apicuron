import {
	ConflictException,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import { PRPayloadDto } from '../dto/pr_payload.dto';
import { GithubOrcidResolver } from '../helpers/github-orcid.resolver';
import { Logger } from '@nestjs/common';
import { mapPRPayloadToContributions } from '../mappers/contribution.mapper';
import { SubmitReportDto } from 'src/submit-reports/dto/submit-report.dto';
import { SubmitReportService } from 'src/submit-reports/services/submit-reports.service';
import { PendingReportsService } from 'src/pending_reports/services/pending-reports.service';
import { ContributorIdentifierType } from 'src/core/enums';

@Injectable()
export class PrContributionProcessor {
	private readonly logger = new Logger(PrContributionProcessor.name);
	constructor(
		private readonly orcidResolver: GithubOrcidResolver,
		private readonly submitReportsService: SubmitReportService,
		private readonly pendingReportsService: PendingReportsService,
	) {}
	async process(payload: PRPayloadDto) {
		const contributions = mapPRPayloadToContributions(payload);

		const failedInserts: { contribution: string; reason: string }[] = [];
		for (const c of contributions) {
			const orcid = await this.orcidResolver.resolve(c.github_login);
			if (!orcid) {
				this.logger.warn(
					`Could not resolve ORCID for github_login: ${c.github_login}, saving report as Pending`,
				);
				try {
					await this.pendingReportsService.createPendingReport({
						resource_id: c.resource_id,
						contributor_identifier: c.github_login,
						contributor_identifier_type: ContributorIdentifierType.GITHUB,
						activity_term: c.activity_term,
						entity_uri: c.entity_uri,
						timestamp: c.timestamp,
					});
				} catch (error) {
					this.logger.error(
						`Failed to save report as Pending for contribution:`,
						JSON.stringify(c),
						error,
					);
					failedInserts.push({
						contribution: JSON.stringify(c),
						reason: error instanceof Error ? error.message : String(error),
					});
				}
				continue;
			}
			const contribution: SubmitReportDto = {
				activity_term: c.activity_term,
				curator_orcid: orcid,
				entity_uri: c.entity_uri,
				resource_id: c.resource_id,
				timestamp: c.timestamp,
				league: 'default',
			};
			try {
				await this.submitReportsService.insertReport(contribution);
			} catch (error) {
				if (error instanceof ConflictException) {
					this.logger.warn(
						`Attempt at duplicate report insertion. Skipping gracefully.`,
					);
				} else {
					this.logger.error(
						`Failed to submit report for github_login ${
							c.github_login
						} (ORCID: ${orcid}): ${
							error instanceof Error ? error.message : String(error)
						}`,
						error instanceof Error ? error.stack : undefined,
					);
					failedInserts.push({
						contribution: JSON.stringify(c),
						reason: error instanceof Error ? error.message : String(error),
					});
				}
			}
		}
		if (failedInserts.length > 0) {
			this.logger.error(
				`Failed to process ${
					failedInserts.length
				} contributions: ${JSON.stringify(failedInserts)}`,
			);
			throw new InternalServerErrorException(
				`Failed to process ${
					failedInserts.length
				} contributions: ${JSON.stringify(
					failedInserts.map((i) => i.contribution),
				)}`,
			);
		}
	}
}
