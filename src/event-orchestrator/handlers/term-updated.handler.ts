import { Injectable } from '@nestjs/common';
import { IEventHandler } from '@nestjs/cqrs';
import { Aggregator } from '../interfaces/aggregator.interface';
import { OnEvent } from '@nestjs/event-emitter';
import { TermUpdatedEvent } from '../../terms/events/events';
import { BaseAggregatorRunner } from '../aggregator-runners/base.runner';

@Injectable()
export class TermUpdatedEventHandler implements IEventHandler {
	constructor(protected aggregatorRunner: BaseAggregatorRunner) {}

	@OnEvent(TermUpdatedEvent.name, { promisify: true, async: true })
	async handle(payload: TermUpdatedEvent) {
		return await this.aggregatorRunner.run(async (aggregator: Aggregator) => {
			await aggregator.termUpdated(payload.oldTerm, payload.newTerm);
			return;
		});
	}
}
