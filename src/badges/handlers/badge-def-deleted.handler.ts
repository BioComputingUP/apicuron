import { Injectable } from '@nestjs/common';
import { BadgeAggregatorService } from '../services/badge-aggregator.service';
import { OnEvent } from '@nestjs/event-emitter';
import { BadgeDefDeletedEvent } from '../events/badge-def-deleted.event';

@Injectable()
export class BadgeDefDeletedEventHandler {
	constructor(protected badgeAggregator: BadgeAggregatorService) {}

	@OnEvent(BadgeDefDeletedEvent.name, { promisify: true, async: true })
	async handle(badgeDefDeleted: BadgeDefDeletedEvent) {
		await this.badgeAggregator.removeAllResourceAggregates(
			badgeDefDeleted.badgeDef.resource_id,
		);
		await this.badgeAggregator.applyAllReports(
			badgeDefDeleted.badgeDef.resource_id,
		);
	}
}
