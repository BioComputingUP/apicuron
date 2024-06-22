import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, QueryOptions } from 'mongoose';
import { PartnerResourcesService } from '../resources/partner-resources/services/partner-resources.service';
import {
	BadgeDocument,
	Badge,
} from '../core/schemas/achievements/badges.schema';
import {
	Medal,
	MedalDocument,
} from '../core/schemas/achievements/medals.schema';
import { AchievementDocument } from '../core/schemas/achievements/achievements.schema';
import { AchievementState } from '../core/enums';

@Injectable()
export class AchievementsService {
	constructor(
		protected partnerResourceService: PartnerResourcesService,
		@InjectModel(Badge.name) protected badgeModel: Model<BadgeDocument>,
		@InjectModel(Medal.name) protected medalModel: Model<MedalDocument>,
	) {}

	async user_achievements({
		curator_orcid,
		resource_id,
		...filter
	}: {
		curator_orcid: string;
		resource_id: string;
	} & FilterQuery<AchievementDocument>) {
		const resource_uri = await this.partnerResourceService.retrieve_uri(
			resource_id,
		);
		const badgesPromise = this.badgeModel.find({
			curator_orcid,
			...filter,
			$or: [{ resource_id }, { resource_uri }],
		});
		const medalsPromise = this.medalModel.find({
			curator_orcid,
			...filter,
			$or: [{ resource_id }, { resource_uri }],
		});
		const [badges, medals] = await Promise.all([badgesPromise, medalsPromise]);
		return {
			badges,
			medals,
		};
	}

	public async user_badge_count(resource_id: string, curator_orcid: string) {
		return await this.badgeModel.count({
			resource_id,
			curator_orcid,
			state: AchievementState.achieved,
		});
	}

	public async user_medal_count(resource_id: string, curator_orcid: string) {
		return await this.medalModel.count({
			resource_id,
			curator_orcid,
			state: AchievementState.achieved,
		});
	}
}
