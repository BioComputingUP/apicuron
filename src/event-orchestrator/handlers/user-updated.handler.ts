import { Injectable } from '@nestjs/common';
import { IEventHandler } from '@nestjs/cqrs';
import { Aggregator } from '../interfaces/aggregator.interface';
import { OnEvent } from '@nestjs/event-emitter';
import { UserRepository } from '../../core/repositories/user.repository';
import { EntityCreatedEvent, EntityUpdatedEvent } from '../../core/events';
import { UserDocument } from '../../core/schemas/user.schema';
import { SubmissionRunner } from '../aggregator-runners/bulk-submission.runner';

@Injectable()
export class UserUpdatedEventHandler implements IEventHandler {
	constructor(protected aggregatorRunner: SubmissionRunner) {
		console.log([
			UserRepository.EntityCreatedEvent,
			UserRepository.EntityUpdatedEvent,
		]);
	}

	@OnEvent(UserRepository.EntityUpdatedEvent, { promisify: true, async: true })
	@OnEvent(UserRepository.EntityCreatedEvent, { promisify: true, async: true })
	async handle(
		payload:
			| EntityCreatedEvent<UserDocument>
			| EntityUpdatedEvent<UserDocument>,
	) {
		return await this.aggregatorRunner.run(async (aggregator: Aggregator) => {
			return await aggregator.updatedUser(payload);
		});
	}
}
