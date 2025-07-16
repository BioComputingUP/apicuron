import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { BadgeDefCreatedEvent } from '../events/badge-def-created.event';
import { ResourceBadgesUpdatedEvent } from '../events/badge-count-updated.event';
import { BadgeAggregatorService } from '../services/badge-aggregator.service';

@Injectable()
export class BadgeDefCreatedEventHandler {
	constructor(
		protected badgeAggregator: BadgeAggregatorService,
		protected eventEmitter: EventEmitter2,
	) {}

	@OnEvent(BadgeDefCreatedEvent.name, { promisify: true, async: true })
	async handle({ badgeDef }: BadgeDefCreatedEvent) {
		await this.badgeAggregator.createBadges({
			resource_id: badgeDef.resource_id,
			league: badgeDef.league,
			name: badgeDef.name,
		});

		await this.eventEmitter.emitAsync(
			ResourceBadgesUpdatedEvent.name,
			new ResourceBadgesUpdatedEvent(badgeDef.resource_id),
		);
	}
}
