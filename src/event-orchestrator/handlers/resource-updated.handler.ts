import { Injectable } from '@nestjs/common';
import { SubmissionRunner } from '../aggregator-runners/bulk-submission.runner';
import { IEventHandler } from '@nestjs/cqrs';
import { OnEvent } from '@nestjs/event-emitter';
import { PartnerResourceUpdatedEvent } from '../../resources/partner-resources/events/resource-updated.event';
import { Aggregator } from '../interfaces/aggregator.interface';

@Injectable()
export class ResourceUpdatedEventHandler implements IEventHandler {
	constructor(protected runner: SubmissionRunner) {}

	@OnEvent(PartnerResourceUpdatedEvent.name, { promisify: true, async: true })
	handle(event: PartnerResourceUpdatedEvent) {
		return this.runner.run(async (aggregator: Aggregator) => {
			// TODO: Update this
			if (!aggregator.updatedResource) {
				return;
			}
			return await aggregator.updatedResource(event);
		});
	}
}
