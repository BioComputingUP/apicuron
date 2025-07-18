import { Injectable } from '@nestjs/common';
import { IEventHandler } from '@nestjs/cqrs';
import { Aggregator } from '../interfaces/aggregator.interface';
import { OnEvent } from '@nestjs/event-emitter';
import { TermDeletedEvent } from '../../terms/events/events';
import { SubmissionRunner } from '../aggregator-runners/bulk-submission.runner';

@Injectable()
export class TermDeletedEventHandler implements IEventHandler {
	constructor(protected aggregatorRunner: SubmissionRunner) {}

	@OnEvent(TermDeletedEvent.name, { promisify: true, async: true })
	async handle(payload: TermDeletedEvent) {
		return await this.aggregatorRunner.run(async (aggregator: Aggregator) => {
			await aggregator.termDeleted(payload.term);
		});
	}
}
