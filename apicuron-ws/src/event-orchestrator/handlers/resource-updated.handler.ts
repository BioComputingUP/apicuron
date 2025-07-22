import { Injectable, Logger } from '@nestjs/common';
import { IEventHandler } from '@nestjs/cqrs';
import { OnEvent } from '@nestjs/event-emitter';
import { PartnerResourceUpdatedEvent } from 'src/core/repositories/partner-resource.repository';
import { SubmissionRunner } from '../aggregator-runners/bulk-submission.runner';
import { Aggregator } from '../interfaces/aggregator.interface';

@Injectable()
export class ResourceUpdatedEventHandler implements IEventHandler {
	constructor(protected runner: SubmissionRunner) {}
	logger = new Logger(ResourceUpdatedEventHandler.name);
	@OnEvent(PartnerResourceUpdatedEvent.name, {
		promisify: true,
		async: true,
	})
	handle(event: PartnerResourceUpdatedEvent) {
		return this.runner.run(async (aggregator: Aggregator) => {
			this.logger.debug(
				`Handling resource updated event for ${event.after.resource_id}`,
			);
			if (!aggregator.updatedResource) {
				return;
			}
			return await aggregator.updatedResource(event.after);
		});
	}
}
