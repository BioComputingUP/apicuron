import { Injectable } from '@nestjs/common';
import { IEventHandler } from '@nestjs/cqrs';
import { Aggregator } from '../interfaces/aggregator.interface';
import { OnEvent } from '@nestjs/event-emitter';
import { UserPrivacyUpdatedEvent } from '../../auth/users/events/update-privacy';
import { BaseAggregatorRunner } from '../aggregator-runners/base.runner';

@Injectable()
export class UserPrivacyUpdatedEventHandler implements IEventHandler {
	constructor(protected aggregatorRunner: BaseAggregatorRunner) {}

	@OnEvent(UserPrivacyUpdatedEvent.name, { promisify: true, async: true })
	async handle(payload: UserPrivacyUpdatedEvent) {
		return await this.aggregatorRunner.run(async (aggregator: Aggregator) => {
			return await aggregator.updateUserPrivacy(
				payload.user.orcid_id,
				payload.privacy,
			);
		});
	}
}
