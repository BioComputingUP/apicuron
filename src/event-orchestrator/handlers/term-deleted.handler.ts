import { Inject, Injectable } from '@nestjs/common';
import { IEventHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { Aggregator } from '../interfaces/aggregator.interface';
import { EventOrchestratorModuleOptions } from '../interfaces/event-orchestrator-options.interface';
import { MODULE_OPTIONS_TOKEN } from '../event-orchestrator.module-definition';
import { OnEvent } from '@nestjs/event-emitter';
import {
	ITermDeletedEventPayload,
	TermDeletedEvent,
} from '../../terms/events/events';

@Injectable()
export class TermDeletedEventHandler implements IEventHandler {
	constructor(
		@Inject(MODULE_OPTIONS_TOKEN)
		protected options: EventOrchestratorModuleOptions,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
	) {
		this.aggregator = options.aggregator;
	}
	aggregator: Aggregator;

	@OnEvent(TermDeletedEvent.name, { promisify: true, async: true })
	async handle(payload: ITermDeletedEventPayload) {
		await this.aggregator.removeAllResourceAggregates(payload.term.resource_id);
		await this.aggregator.applyAllReports(payload.term.resource_id);
		return;
	}
}
