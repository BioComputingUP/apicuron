import { Injectable } from '@nestjs/common';
import { BadgeAggregatorService } from '../services/badge-aggregator.service';
import { OnEvent } from '@nestjs/event-emitter';
import { BadgeDefUpdatedEvent } from '../events/badge-def-updated.event';
import { InjectModel } from '@nestjs/mongoose';
import {
	Badge,
	BadgeDocument,
} from '../../core/schemas/achievements/badges.schema';
import { FilterQuery, Model } from 'mongoose';
import { ComputeBadgesService } from '../services/compute-badges.service';

@Injectable()
export class BadgeDefUpdatedEventHandler {
	constructor(
		protected badgeAggregator: BadgeAggregatorService,
		@InjectModel(Badge.name) protected badgeModel: Model<BadgeDocument>,
		protected computeBadges: ComputeBadgesService,
	) {}

	@OnEvent(BadgeDefUpdatedEvent.name, { promisify: true, async: true })
	async handle({ badgeDef }: BadgeDefUpdatedEvent) {
		const filter: FilterQuery<BadgeDocument> = {
			name: badgeDef.name,
			resource_id: badgeDef.resource_id,
			league: badgeDef.league,
		};
		await this.badgeModel.deleteMany(filter);
		await this.computeBadges.computeBadges(filter);
	}
}
