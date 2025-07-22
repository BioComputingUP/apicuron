import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { FilterQuery } from 'mongoose';
import { AchievementState } from '../core/enums';
import {
	Achievement,
	AchievementFilter,
	Badge,
	BadgeModel,
	Medal,
	MedalModel,
} from '../core/schemas';
import { PartnerResourcesService } from '../resources/partner-resources/services/partner-resources.service';
import { UserAchievements } from './dto/achievements.dto';

@Injectable()
export class AchievementsService {
	constructor(
		protected partnerResourceService: PartnerResourcesService,
		@InjectModel(Badge.name) protected badgeModel: BadgeModel,
		@InjectModel(Medal.name) protected medalModel: MedalModel,
	) {}

	async user_achievements({
		curator_orcid,
		resource_id,
		...filter
	}: {
		curator_orcid: string;
		resource_id: string;
	} & AchievementFilter) {
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
		const result = {
			badges,
			medals,
		};
		return plainToInstance(UserAchievements, result);
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
