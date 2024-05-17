import { Injectable } from '@nestjs/common';
import { BadgeAggregatorService } from '../services/badge-aggregator.service';
import { OnEvent } from '@nestjs/event-emitter';
import { BadgeDefCreatedEvent } from '../events/badge-def-created.event';

@Injectable()
export class BadgeDefCreatedEventHandler {
	constructor(protected badgeAggregator: BadgeAggregatorService) {}

	@OnEvent(BadgeDefCreatedEvent.name, { promisify: true, async: true })
	async handle(badgeDefDeleted: BadgeDefCreatedEvent) {
		await this.badgeAggregator.removeAllResourceAggregates(
			badgeDefDeleted.badgeDef.resource_id,
		);
		await this.badgeAggregator.applyAllReports(
			badgeDefDeleted.badgeDef.resource_id,
		);
	}
}
