import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
	Badge,
	BadgeDocument,
} from '../../core/schemas/achievements/badges.schema';
import { FilterQuery, Model } from 'mongoose';
import { AchievementState } from '../../core/enums';

@Injectable()
export class EarnedBadgesService {
	constructor(
		@InjectModel(Badge.name) protected badgeModel: Model<BadgeDocument>,
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
