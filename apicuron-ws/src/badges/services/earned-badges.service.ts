import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery } from 'mongoose';
import { AchievementState } from '../../core/enums';
import {
	Badge,
	BadgeDocument,
	BadgeModel
} from '../../core/schemas/achievements/badges.schema';

@Injectable()
export class EarnedBadgesService {
	constructor(
		@InjectModel(Badge.name) protected badgeModel: BadgeModel,
	) {}

	async getEarnedBadgesCount(filter: FilterQuery<BadgeDocument>) {
		return await this.badgeModel.count({
			$and: [
				filter,
				{
					state: AchievementState.achieved,
				},
			],
		});
	}
}
