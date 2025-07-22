import { Injectable, Logger } from '@nestjs/common';
import { IEventHandler } from '@nestjs/cqrs';
import { SubmissionRunner } from '../aggregator-runners/bulk-submission.runner';
import { OnEvent } from '@nestjs/event-emitter';
import { LeagueUpdatedEvent } from '../../resources/partner-resources/leagues/events/league-updated.event';
import { Aggregator } from '../interfaces/aggregator.interface';

@Injectable()
export class LeagueUpdatedHandler implements IEventHandler {
	logger = new Logger(LeagueUpdatedHandler.name);
	constructor(protected runner: SubmissionRunner) {}

	@OnEvent(LeagueUpdatedEvent.name, { promisify: true, async: true })
	async handle(payload: LeagueUpdatedEvent) {
		this.logger.debug(`triggered event ${LeagueUpdatedEvent.name}`);
		if (!payload.privacyChanged()) {
			return;
		}
		try {
			return await this.runner.run(async (aggregator: Aggregator) => {
				await aggregator.updatedLeague(payload);
			});
		} catch (err: any) {
			if (err instanceof Error) {
				this.logger.error(
					`Error occured when handling event: ${
						LeagueUpdatedEvent.name
					}: with payload:\n${JSON.stringify(payload, null, 2)}`,
				);
				this.logger.error(err.message, err.stack, err.name);
			}
		}
	}
}
