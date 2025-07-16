import { Injectable } from '@nestjs/common';
import { IEventHandler } from '@nestjs/cqrs';
import { OnEvent } from '@nestjs/event-emitter';
import {
	UserCreatedEvent,
	UserUpdatedEvent,
} from '../../core/repositories/user.repository';
import { SubmissionRunner } from '../aggregator-runners/bulk-submission.runner';
import { Aggregator } from '../interfaces/aggregator.interface';

@Injectable()
export class UserUpdatedEventHandler implements IEventHandler {
	constructor(protected aggregatorRunner: SubmissionRunner) {}

	@OnEvent(UserUpdatedEvent.name, { promisify: true, async: true })
	@OnEvent(UserCreatedEvent.name, { promisify: true, async: true })
	async handle(payload: UserCreatedEvent | UserUpdatedEvent) {
		return await this.aggregatorRunner.run(async (aggregator: Aggregator) => {
			return await aggregator.updatedUser(payload);
		});
	}
}
