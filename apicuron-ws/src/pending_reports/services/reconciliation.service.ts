import { ConflictException, Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { UserOrcidIdentifiedEvent } from 'src/auth/users/events/orcid-identified.event';
import { ContributorIdentifierType } from 'src/core/enums';
import { PendingReportsRepository } from '../repository/pending-report.repository';
import { PendingReport } from '../entities/pending-report.entity';
import { SubmitReportDto } from 'src/submit-reports/dto/submit-report.dto';
import { SubmitReportService } from 'src/submit-reports/services/submit-reports.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class ReconcilationService {
	private readonly logger = new Logger(ReconcilationService.name);

	constructor(
		private readonly repository: PendingReportsRepository,
		protected readonly submitService: SubmitReportService,
		protected eventEmitter: EventEmitter2,
	) {}

	@OnEvent(UserOrcidIdentifiedEvent.eventName, { async: true, promisify: true })
	async handleUserOrcidIdentified(eventPayload: UserOrcidIdentifiedEvent) {
		try {
			await this.reconcile(
				eventPayload.contributor_identifier,
				eventPayload.contributor_identifier_type,
				eventPayload.orcid,
			);
		} catch (error: unknown) {
			this.logger.error(error);
		}
	}

	async reconcile(
		identifier: string,
		identifier_type: ContributorIdentifierType,
		orcid: string,
	) {
		const pendingReports = await this.repository.findByContributorIdentifier(
			identifier,
			identifier_type,
		);

		const result: {
			submitted: number;
			failed: Array<{ report: PendingReport; error: unknown }>;
		} = {
			submitted: 0,
			failed: [],
		};

		for (const report of pendingReports) {
			const reportDto = this.toSubmitReportDto(report, orcid);
			try {
				await this.submitService.insertReport(reportDto);
				await this.repository.archive(report.id);
				result.submitted++;
			} catch (error: unknown) {
				if (error instanceof ConflictException) {
					// already inserted — treat as reconciled
					await this.repository.archive(report.id);
					result.submitted++;
					continue;
				}
				await this.repository.markAsFailed(report.id, error);
				result.failed.push({ report, error });
			}
		}
		return result;
	}
	private toSubmitReportDto(
		report: PendingReport,
		orcid: string,
	): SubmitReportDto {
		const dto = new SubmitReportDto();
		dto.activity_term = report.activity_term;
		dto.curator_orcid = orcid;
		dto.entity_uri = report.entity_uri;
		dto.resource_id = report.resource_id;
		dto.timestamp = report.timestamp;
		return dto;
	}
}
