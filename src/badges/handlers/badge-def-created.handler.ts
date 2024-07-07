import { Injectable } from '@nestjs/common';
import { BadgeAggregatorService } from '../services/badge-aggregator.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { BadgeDefCreatedEvent } from '../events/badge-def-created.event';
import { ComputeBadgesService } from '../services/compute-badges.service';
import { ResourceBadgesUpdatedEvent } from '../events/badge-count-updated.event';

@Injectable()
export class BadgeDefCreatedEventHandler {
	constructor(
		protected computeBadges: ComputeBadgesService,
		protected eventEmitter: EventEmitter2,
	) {}

	@OnEvent(BadgeDefCreatedEvent.name, { promisify: true, async: true })
	async handle({ badgeDef }: BadgeDefCreatedEvent) {
		await this.computeBadges.computeBadges({
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
