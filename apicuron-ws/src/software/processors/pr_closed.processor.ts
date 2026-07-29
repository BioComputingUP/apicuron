import { ConflictException, Injectable } from '@nestjs/common';
import { PRPayloadDto } from '../dto/pr_payload.dto';
import { GithubOrcidResolver } from '../helpers/github-orcid.resolver';
import { Logger } from '@nestjs/common';
import { mapPRPayloadToContributions } from '../mappers/contribution.mapper';
import { SubmitReportDto } from 'src/submit-reports/dto/submit-report.dto';
import { SubmitReportService } from 'src/submit-reports/services/submit-reports.service';

@Injectable()
export class PrContributionProcessor {
	private readonly logger = new Logger(PrContributionProcessor.name);
	constructor(
		private readonly orcidResolver: GithubOrcidResolver,
		private readonly submitReportsService: SubmitReportService,
	) {}
	async process(payload: PRPayloadDto) {
		const contributions = mapPRPayloadToContributions(payload);

		for (const c of contributions) {
			const orcid = await this.orcidResolver.resolve(c.github_login);
			if (!orcid) {
				this.logger.warn(
					`Could not resolve ORCID for github_login: ${c.github_login}`,
				);
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
					throw error;
				}
			}
		}
	}
}
