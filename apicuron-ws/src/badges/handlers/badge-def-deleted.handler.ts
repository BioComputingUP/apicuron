import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import {
	Badge, BadgeModel
} from '../../core/schemas/achievements/badges.schema';
import { ResourceBadgesUpdatedEvent } from '../events/badge-count-updated.event';
import { BadgeDefDeletedEvent } from '../events/badge-def-deleted.event';

@Injectable()
export class BadgeDefDeletedEventHandler {
	logger = new Logger(BadgeDefDeletedEventHandler.name);
	constructor(
		@InjectModel(Badge.name) protected badgeModel: BadgeModel,
		protected eventEmitter: EventEmitter2,
	) {}

	@OnEvent(BadgeDefDeletedEvent.name, { promisify: true, async: true })
	async handle({ badgeDef }: BadgeDefDeletedEvent) {
		const badgesDeleted = await this.badgeModel.deleteMany({
			name: badgeDef.name,
			resource_id: badgeDef.resource_id,
			league: badgeDef.league,
		});

		this.logger.debug(
			`Deleted ${badgesDeleted.deletedCount} badges reacting to BadgeDefDeletedEvent`,
		);

		await this.eventEmitter.emitAsync(
			ResourceBadgesUpdatedEvent.name,
			new ResourceBadgesUpdatedEvent(badgeDef.resource_id),
		);

		return badgesDeleted;
	}
}
