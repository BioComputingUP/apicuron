import { Inject, Injectable } from '@nestjs/common';
import { IEventHandler } from '@nestjs/cqrs';
import { MODULE_OPTIONS_TOKEN } from '../event-orchestrator.module-definition';
import { EventOrchestratorModuleOptions } from '../interfaces/event-orchestrator-options.interface';
import { OnEvent } from '@nestjs/event-emitter';
import { LeagueDeletedEvent } from '../../resources/partner-resources/leagues/events/league-deleted-event';
import { Aggregator } from '../interfaces/aggregator.interface';

@Injectable()
export class DeleteLeagueHandler implements IEventHandler {
	aggregator: Aggregator;
	constructor(
		@Inject(MODULE_OPTIONS_TOKEN)
		protected options: EventOrchestratorModuleOptions,
	) {
		this.aggregator = options.aggregator;
	}

	@OnEvent(LeagueDeletedEvent.name, { async: true, promisify: true })
	async handle(event: LeagueDeletedEvent) {
		return await this.aggregator.deleteLeague(event.resource_id, event.name);
	}
}
