import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { BadgeDefUpdatedEvent } from '../events/badge-def-updated.event';
import { BadgeDocument } from '../../core/schemas/achievements/badges.schema';
import { FilterQuery } from 'mongoose';
import { ResourceBadgesUpdatedEvent } from '../events/badge-count-updated.event';
import { BadgeAggregatorService } from '../services/badge-aggregator.service';

@Injectable()
export class BadgeDefUpdatedEventHandler {
	constructor(
		protected badgeAggregator: BadgeAggregatorService,
		protected eventEmitter: EventEmitter2,
	) {}

	@OnEvent(BadgeDefUpdatedEvent.name, { promisify: true, async: true })
	async handle({ badgeDef }: BadgeDefUpdatedEvent) {
		const filter: FilterQuery<BadgeDocument> = {
			name: badgeDef.name,
			resource_id: badgeDef.resource_id,
			league: badgeDef.league,
		};
		await this.badgeAggregator.reComputeBadges(filter);
		await this.eventEmitter.emitAsync(
			ResourceBadgesUpdatedEvent.name,
			new ResourceBadgesUpdatedEvent(badgeDef.resource_id),
		);
	}
}
