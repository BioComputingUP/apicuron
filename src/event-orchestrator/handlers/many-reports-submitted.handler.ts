import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { Aggregator } from '../interfaces/aggregator.interface';
import { EventOrchestratorModuleOptions } from '../interfaces/event-orchestrator-options.interface';
import { MODULE_OPTIONS_TOKEN } from '../event-orchestrator.module-definition';
import {
	IManyReportsSubmittedEventPayload,
	ManyReportsSubmittedEvent,
} from '../../submit-reports/events/events';
import { OnEvent } from '@nestjs/event-emitter';
import { IEventHandler } from '@nestjs/cqrs';
import { AggregatorManager } from '../services/aggregator-manager.service';
import { BaseAggregatorRunner } from '../aggregator-runners/base.runner';

@Injectable()
export class ManyReportsSubmittedHandler implements IEventHandler {
	constructor(
		protected runner: BaseAggregatorRunner,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
	) {}

	payloadProcessorFactory(payload: IManyReportsSubmittedEventPayload) {
		return async (aggregator: Aggregator) => {
			const reportDocuments = payload.reports.map(
				(report) => new this.reportModel(report),
			);
			reportDocuments.sort(
				(a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
			);

			const resources = payload.resources;
			const users = payload.users;

			for (const report of reportDocuments) {
				const resource = resources.find((r) => r.id === report.resource_id);
				const user = users.find((u) => u.id === report.curator_orcid);
				await aggregator.applyReport(report, user, resource);
			}
		};
	}

	@OnEvent(ManyReportsSubmittedEvent, { async: true, promisify: true })
	async handle(payload: IManyReportsSubmittedEventPayload) {
		const processor = this.payloadProcessorFactory(payload);
		await this.runner.run(processor);
	}
}
