import { Injectable } from '@nestjs/common';
import { IEventHandler } from '@nestjs/cqrs';
import { Aggregator } from '../interfaces/aggregator.interface';
import { OnEvent } from '@nestjs/event-emitter';
import {
	ITermUpdatedEventPayload,
	TermUpdatedEvent,
} from '../../terms/events/events';
import { BaseAggregatorRunner } from '../aggregator-runners/base.runner';

@Injectable()
export class TermUpdatedEventHandler implements IEventHandler {
	constructor(protected aggregatorRunner: BaseAggregatorRunner) {}

	@OnEvent(TermUpdatedEvent, { promisify: true, async: true })
	async handle(payload: ITermUpdatedEventPayload) {
		return await this.aggregatorRunner.run(async (aggregator: Aggregator) => {
			await aggregator.recomputeAllResourceAggregates(payload.term.resource_id);
			return;
		});
	}
}
