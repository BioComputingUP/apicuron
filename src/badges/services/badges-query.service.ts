import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, QueryOptions } from 'mongoose';
import { AchievementState } from '../../core/enums';
import {
	Badge,
	BadgeDocument,
} from '../../core/schemas/achievements/badges.schema';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';

@Injectable()
export class BadgesQueryService {
	constructor(
		@InjectModel(Badge.name) protected badgeModel: Model<BadgeDocument>,
		protected partnerResourceService: PartnerResourcesService,
	) {}

	async getBadges(
		filter: FilterQuery<BadgeDocument>,
		options: QueryOptions<BadgeDocument>,
	) {
		filter.state = AchievementState.achieved;
		const dataPromise = this.badgeModel.find(filter, {}, options);
		const countPromise = this.badgeModel.count(filter);

		const [data, count] = await Promise.all([dataPromise, countPromise]);
		return {
			data,
			count,
		};
	}
}
