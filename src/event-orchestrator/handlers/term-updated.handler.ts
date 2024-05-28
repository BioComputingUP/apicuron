import { Inject, Injectable } from '@nestjs/common';
import { IEventHandler } from '@nestjs/cqrs';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Aggregator } from '../interfaces/aggregator.interface';
import { EventOrchestratorModuleOptions } from '../interfaces/event-orchestrator-options.interface';
import { MODULE_OPTIONS_TOKEN } from '../event-orchestrator.module-definition';
import { OnEvent } from '@nestjs/event-emitter';
import {
	ITermUpdatedEventPayload,
	TermUpdatedEvent,
} from '../../terms/events/events';

@Injectable()
export class TermUpdatedEventHandler implements IEventHandler {
	constructor(
		@Inject(MODULE_OPTIONS_TOKEN)
		protected options: EventOrchestratorModuleOptions,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
	) {
		this.aggregator = options.aggregator;
	}
	aggregator: Aggregator;

	@OnEvent(TermUpdatedEvent, { promisify: true, async: true })
	async handle(payload: ITermUpdatedEventPayload) {
		await this.aggregator.removeAllResourceAggregates(payload.term.resource_id);
		await this.aggregator.applyAllReports(payload.term.resource_id);
		return;
	}
}
