import { Aggregator } from '../interfaces/aggregator.interface';
import { IEventHandler } from '@nestjs/cqrs';
import { OnEvent } from '@nestjs/event-emitter';
import {
	AllResourceReportsDeletedEvent,
	IAllResourceReportsDeletedEventPayload,
} from '../../submit-reports/events/events';
import { SubmissionRunner } from '../aggregator-runners/bulk-submission.runner';

export class ResourceReportsDeletedHandler implements IEventHandler {
	constructor(protected aggregatorRunner: SubmissionRunner) {}

	@OnEvent(AllResourceReportsDeletedEvent, { async: true, promisify: true })
	async handle({ resource_id }: IAllResourceReportsDeletedEventPayload) {
		await this.aggregatorRunner.run(async (aggregator: Aggregator) => {
			await aggregator.removeAllResourceAggregates(resource_id);
		});
	}
}
