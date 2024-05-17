import { Injectable } from '@nestjs/common';
import { BadgeAggregatorService } from '../services/badge-aggregator.service';
import { OnEvent } from '@nestjs/event-emitter';
import { BadgeDefUpdatedEvent } from '../events/badge-def-updated.event';

@Injectable()
export class BadgeDefUpdatedEventHandler {
	constructor(protected badgeAggregator: BadgeAggregatorService) {}

	@OnEvent(BadgeDefUpdatedEvent.name, { promisify: true, async: true })
	async handle(badgeDefDeleted: BadgeDefUpdatedEvent) {
		await this.badgeAggregator.removeAllResourceAggregates(
			badgeDefDeleted.badgeDef.resource_id,
		);
		await this.badgeAggregator.applyAllReports(
			badgeDefDeleted.badgeDef.resource_id,
		);
	}
}
