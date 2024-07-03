import { Injectable, Logger } from '@nestjs/common';
import { BadgeAggregatorService } from '../services/badge-aggregator.service';
import { OnEvent } from '@nestjs/event-emitter';
import { BadgeDefDeletedEvent } from '../events/badge-def-deleted.event';
import { InjectModel } from '@nestjs/mongoose';
import {
	Badge,
	BadgeDocument,
} from '../../core/schemas/achievements/badges.schema';
import { Model } from 'mongoose';

@Injectable()
export class BadgeDefDeletedEventHandler {
	logger = new Logger(BadgeDefDeletedEventHandler.name);
	constructor(
		protected badgeAggregator: BadgeAggregatorService,
		@InjectModel(Badge.name) protected badgeModel: Model<BadgeDocument>,
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
		return badgesDeleted;
	}
}
