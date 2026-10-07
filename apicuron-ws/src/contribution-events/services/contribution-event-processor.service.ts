import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { ContributorIdentifierType, EventOutputKind, EventOutputStatus } from 'src/core/enums';
import { PendingReportsService } from '../../pending_reports/services/pending-reports.service';
import { SubmitReportService } from '../../submit-reports/services/submit-reports.service';
import { ContributionEventOutput } from '../entities/contribution-event.entity';
import { GithubIdentityRepository } from '../identity/github-identity.repository';
import {
	GITHUB_PR_MERGED_TYPE,
	INTERPRETER_VERSION,
	IntendedReport,
	InterpretationError,
	interpretMergedPullRequest,
} from '../interpretation/github-pr.interpreter';
import { ContributionEventsRepository } from '../repository/contribution-events.repository';

@Injectable()
export class ContributionEventProcessor {
	private readonly logger = new Logger(ContributionEventProcessor.name);

	constructor(
		private readonly events: ContributionEventsRepository,
		private readonly identity: GithubIdentityRepository,
		private readonly submitReportService: SubmitReportService,
		private readonly pendingReportsService: PendingReportsService,
	) {}

	/** Processes events one after another (used for batches). */
	async processSequentially(eventIds: string[]): Promise<void> {
		for (const id of eventIds) {
			await this.process(id);
		}
	}

	/** Processes one stored event. Never throws: every outcome is recorded on the event. */
	async process(eventId: string): Promise<void> {
		try {
            // verify data
			const event = await this.events.findById(eventId);
			if (!event) {
				this.logger.error(`Event ${eventId} not found`);
				return;
			}
            // decide which interpreter function and run it. TODO: this should probably be a registry of interpreters once more added
			if (event.type !== GITHUB_PR_MERGED_TYPE) {
				throw new InterpretationError(`No interpreter for event type "${event.type}"`);
			}
			const intended = interpretMergedPullRequest(event.payload);


            // Insert the intended report to a report or pending report
			const outputs: ContributionEventOutput[] = [];
			for (const report of intended) {
				outputs.push(await this.apply(report, event.resource_id));
			}
            // register failures and successes
			const failed = outputs.filter((o) => o.status === EventOutputStatus.FAILED).length;
			if (failed > 0) {
				await this.events.markFailed(eventId, `${failed} output(s) failed`, outputs, INTERPRETER_VERSION);
			} else {
				await this.events.markProcessed(eventId, INTERPRETER_VERSION, outputs);
			}
		} catch (error) {
			this.logger.error(`Processing event ${eventId} failed: ${error instanceof Error ? error.message : error}`);
			await this.events.markFailed(eventId, error).catch((e) =>
				this.logger.error(`Could not mark event ${eventId} as failed: ${e}`),
			);
		}
	}

	/** Submits one intended report, or stores it as pending if the contributor is unknown. */
	private async apply(report: IntendedReport, resourceId: string): Promise<ContributionEventOutput> {
		let output: ContributionEventOutput = {
			kind: EventOutputKind.PENDING,
			activity_term: report.activity_term,
			contributor_identifier: report.github_id,
			contributor_identifier_type: ContributorIdentifierType.GITHUB,
			status: EventOutputStatus.CREATED,
		};

		try {
			const orcid = await this.identity.findOrcidByGithubId(report.github_id);

			if (orcid) {
				output = {
					...output,
					kind: EventOutputKind.REPORT,
					contributor_identifier: orcid,
					contributor_identifier_type: ContributorIdentifierType.ORCID,
				};
				await this.submitReportService.insertReport({
					activity_term: report.activity_term,
					curator_orcid: orcid,
					entity_uri: report.entity_uri,
					resource_id: resourceId,
					timestamp: report.timestamp,
					league: 'default',
				});
			} else {
				await this.pendingReportsService.createPendingReport({
					resource_id: resourceId,
					contributor_identifier: report.github_id,
					contributor_identifier_type: ContributorIdentifierType.GITHUB,
					contributor_login: report.github_login,
					activity_term: report.activity_term,
					entity_uri: report.entity_uri,
					timestamp: report.timestamp,
				});
			}
			return output;
		} catch (error) {
			if (error instanceof ConflictException) {
				return { ...output, status: EventOutputStatus.ALREADY_EXISTED };
			}
			return {
				...output,
				status: EventOutputStatus.FAILED,
				error: error instanceof Error ? error.message : String(error),
			};
		}
	}
}