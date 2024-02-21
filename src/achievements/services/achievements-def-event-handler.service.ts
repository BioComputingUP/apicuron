import { OnEvent } from '@nestjs/event-emitter';
import { ComputeBadgesService } from './compute-badges.service';
import { ComputeMedalsService } from './compute-medals.service';
import {
	ITermDeletedEventPayload,
	ITermUpdatedEventPayload,
	onTermDeletedEvent,
	onTermUpdatedEvent,
} from '../../terms/events/events';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
	AchievementDef,
	AchievementDefDocument,
} from '../../core/schemas/achievements-def/achievement-def.schema';
import { Injectable } from '@nestjs/common';
import {
	IBadgeDefDeleteEventPayload,
	IBadgeDefUpdateEventPayload,
	IMedalDefDeleteEventPayload,
	IMedalDefUpdateEventPayload,
	onBadgeDefDelete,
	onBadgeDefUpdate,
	onMedalDefDelete,
	onMedalDefUpdate,
} from '../events/events';
import {
	Badge,
	BadgeDocument,
} from '../../core/schemas/achievements/badges.schema';
import {
	Medal,
	MedalDocument,
} from '../../core/schemas/achievements/medals.schema';

@Injectable()
export class AchievementsDefEventHandlerService {
	constructor(
		protected computeBadges: ComputeBadgesService,
		protected computeMedals: ComputeMedalsService,
		@InjectModel(AchievementDef.name)
		protected achievementDefModel: Model<AchievementDefDocument>,
		@InjectModel(Badge.name) protected badgeModel: Model<BadgeDocument>,
		@InjectModel(Medal.name) protected medalModel: Model<MedalDocument>,
	) {}

	@OnEvent(onTermDeletedEvent, { async: true })
	async removeTermFromAchievements({ term }: ITermDeletedEventPayload) {
		const { resource_id, activity_term } = term;
		await this.achievementDefModel.updateMany(
			{
				resource_id,
				list_terms: activity_term,
			},
			{
				$pull: { list_terms: activity_term },
			},
		);
		await Promise.all([
			this.computeBadges.computeResourceBadges({ resource_id }),
			this.computeMedals.computeResourceMedals({ resource_id }),
		]);
	}

	@OnEvent(onTermUpdatedEvent, { async: true, promisify: true })
	async onTermUpdatedEvent({ term }: ITermUpdatedEventPayload) {
		await Promise.all([
			this.computeBadges.computeResourceBadges({
				resource_id: term.resource_id,
			}),
			this.computeMedals.computeResourceMedals({
				resource_id: term.resource_id,
			}),
		]);
	}

	@OnEvent(onBadgeDefDelete, { async: true, promisify: true })
	async onBadgeDefDelete({ badgeDef }: IBadgeDefDeleteEventPayload) {
		const { resource_id, name, league } = badgeDef;
		return await this.badgeModel.deleteMany({
			resource_id,
			name,
			league,
		});
	}

	@OnEvent(onMedalDefDelete, { async: true, promisify: true })
	async onMedalDefDelete({ medalDef }: IMedalDefDeleteEventPayload) {
		const { resource_id, name, league } = medalDef;
		return await this.medalModel.deleteMany({
			resource_id,
			name,
			league,
		});
	}

	@OnEvent(onMedalDefUpdate, { async: true, promisify: true })
	async onMedalDefUpdate({ medalDef }: IMedalDefUpdateEventPayload) {
		return await this.computeMedals.computeMedals(medalDef.toObject());
	}

	@OnEvent(onBadgeDefUpdate, { async: true, promisify: true })
	async onBadgeDefUpdate({ badgeDef }: IBadgeDefUpdateEventPayload) {
		return await this.computeBadges.computeAllBadges(badgeDef.toObject());
	}
}
