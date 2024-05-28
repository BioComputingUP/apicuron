import { Inject, Injectable } from '@nestjs/common';
import { IEventHandler } from '@nestjs/cqrs';
import { MODULE_OPTIONS_TOKEN } from '../event-orchestrator.module-definition';
import { EventOrchestratorModuleOptions } from '../interfaces/event-orchestrator-options.interface';
import { Aggregator } from '../interfaces/aggregator.interface';
import { OnEvent } from '@nestjs/event-emitter';
import { UserPrivacyUpdatedEvent } from '../../auth/users/events/update-privacy';

@Injectable()
export class UserPrivacyUpdatedEventHandler implements IEventHandler {
	aggregator: Aggregator;
	constructor(
		@Inject(MODULE_OPTIONS_TOKEN)
		protected options: EventOrchestratorModuleOptions,
	) {
		this.aggregator = options.aggregator;
	}

	@OnEvent(UserPrivacyUpdatedEvent.name, { promisify: true, async: true })
	async handle(payload: UserPrivacyUpdatedEvent) {
		return await this.aggregator.updateUserPrivacy(
			payload.user.orcid_id,
			payload.privacy,
		);
	}
}
