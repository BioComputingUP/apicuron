import { Injectable } from '@nestjs/common';
import { BadgeAggregatorService } from '../services/badge-aggregator.service';
import { OnEvent } from '@nestjs/event-emitter';
import { BadgeDefCreatedEvent } from '../events/badge-def-created.event';
import { ComputeBadgesService } from '../services/compute-badges.service';

@Injectable()
export class BadgeDefCreatedEventHandler {
	constructor(protected computeBadges: ComputeBadgesService) {}

	@OnEvent(BadgeDefCreatedEvent.name, { promisify: true, async: true })
	async handle({ badgeDef }: BadgeDefCreatedEvent) {
		await this.computeBadges.computeBadges({
			resource_id: badgeDef.resource_id,
			league: badgeDef.league,
			name: badgeDef.name,
		});
	}
}
