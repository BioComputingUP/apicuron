import { Inject, Injectable } from '@nestjs/common';
import { IEventHandler } from '@nestjs/cqrs';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { MODULE_OPTIONS_TOKEN } from '../event-orchestrator.module-definition';
import { Aggregator } from '../interfaces/aggregator.interface';
import { EventOrchestratorModuleOptions } from '../interfaces/event-orchestrator-options.interface';
import { BulkSubmissionEvent } from '../../submit-reports/events/events';

@Injectable()
export class BulkReportSubmissionHandler implements IEventHandler {
	constructor(
		@Inject(MODULE_OPTIONS_TOKEN)
		protected options: EventOrchestratorModuleOptions,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
	) {
		this.aggregator = options.aggregator;
	}

	aggregator: Aggregator;

	@OnEvent(BulkSubmissionEvent.name, { async: true, promisify: true })
	async handle({ resource_ids }: BulkSubmissionEvent) {
		const reComputeAggregates$ = resource_ids.map(
			async (resource_id: string) =>
				await this.aggregator.recomputeAllResourceAggregates(resource_id),
		);

		await Promise.all(reComputeAggregates$);
	}
}
