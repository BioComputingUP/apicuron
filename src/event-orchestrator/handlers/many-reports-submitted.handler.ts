import { Injectable, Logger } from '@nestjs/common';
import { IEventHandler } from '@nestjs/cqrs';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { assertNotNull } from 'src/util/type-assertion.helper';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import {
	IManyReportsSubmittedEventPayload,
	ManyReportsSubmittedEvent,
} from '../../submit-reports/events/events';
import { SubmissionRunner } from '../aggregator-runners/bulk-submission.runner';
import { Aggregator } from '../interfaces/aggregator.interface';

@Injectable()
export class ManyReportsSubmittedHandler implements IEventHandler {
	logger = new Logger(ManyReportsSubmittedHandler.name);
	constructor(
		protected runner: SubmissionRunner,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
	) {}

	payloadProcessorFactory(payload: IManyReportsSubmittedEventPayload) {
		const reportDocuments = payload.reports.map(
			(report) => new this.reportModel(report),
		);
		reportDocuments.sort(
			(a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
		);

		const resources = payload.resources;
		const users = payload.users;
		const terms = payload.terms;

		return async (aggregator: Aggregator) => {
			this.logger.debug(
				`Processing ${reportDocuments.length} reports using aggregator: ${aggregator.constructor.name}`,
			);
			for (const report of reportDocuments) {
				const resource = resources.find(
					(r) => r.resource_id === report.resource_id,
				);
				const user = users.find((u) => u.orcid_id === report.curator_orcid);
				const term = terms.find(
					(t) =>
						t.activity_term === report.activity_term &&
						t.resource_id === report.resource_id &&
						t.league === report.league,
				);
				assertNotNull(
					resource,
					`Resource not found for report with resource_id: ${report.resource_id}`,
				);
				assertNotNull(
					term,
					`Term not found for report with activity_term: ${report.activity_term}, resource_id: ${report.resource_id}, league: ${report.league}`,
				);
				await aggregator.applyReport(report, term, resource, user);
			}
		};
	}

	@OnEvent(ManyReportsSubmittedEvent, { async: true, promisify: true })
	async handle(payload: IManyReportsSubmittedEventPayload) {
		const processor = this.payloadProcessorFactory(payload);
		await this.runner.run(processor);
	}
}
