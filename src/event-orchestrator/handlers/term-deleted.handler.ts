import { Injectable } from '@nestjs/common';
import { IEventHandler } from '@nestjs/cqrs';
import { Aggregator } from '../interfaces/aggregator.interface';
import { OnEvent } from '@nestjs/event-emitter';
import {
	ITermDeletedEventPayload,
	TermDeletedEvent,
} from '../../terms/events/events';
import { AggregatorManager } from '../services/aggregator-manager.service';
import { BaseAggregatorRunner } from '../aggregator-runners/base.runner';

@Injectable()
export class TermDeletedEventHandler implements IEventHandler {
	constructor(protected aggregatorRunner: BaseAggregatorRunner) {}

	@OnEvent(TermDeletedEvent.name, { promisify: true, async: true })
	async handle(payload: ITermDeletedEventPayload) {
		return await this.aggregatorRunner.run(async (aggregator: Aggregator) => {
			await aggregator.removeAllResourceAggregates(payload.term.resource_id);
			await aggregator.applyAllReports(payload.term.resource_id);
		});
	}
}
