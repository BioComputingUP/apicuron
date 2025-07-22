import { Injectable } from '@nestjs/common';
import { IEventHandler } from '@nestjs/cqrs';
import { OnEvent } from '@nestjs/event-emitter';
import { LeagueDeletedEvent } from '../../resources/partner-resources/leagues/events/league-deleted-event';
import { SubmissionRunner } from '../aggregator-runners/bulk-submission.runner';
import { Aggregator } from '../interfaces/aggregator.interface';

@Injectable()
export class DeleteLeagueHandler implements IEventHandler {
	constructor(protected aggregatorRunner: SubmissionRunner) {}

	@OnEvent(LeagueDeletedEvent.name, { async: true, promisify: true })
	/**
	 * Handles the LeagueDeletedEvent by deleting the league from the aggregators.
	 * @param event The LeagueDeletedEvent object containing the details of the league to be deleted.
	 */
	async handle(event: LeagueDeletedEvent) {
		this.aggregatorRunner.run(async (aggregator: Aggregator) => {
			await aggregator.deleteLeague(event.resource_id, event.name);
		});
	}
}
