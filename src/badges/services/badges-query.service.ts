import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, QueryOptions } from 'mongoose';
import { AchievementState } from '../../core/enums';
import {
	Badge,
	BadgeDocument,
} from '../../core/schemas/achievements/badges.schema';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import { plainToClass, plainToInstance } from 'class-transformer';
import { BadgeDto, PrivateBadgeDto } from '../dto/badge.dto';
import { UserBadgesFilter } from '../dto/badge-filter.dto';
import { userResourceEntityPrivacyFilter } from '../../util/privacy.helper';
import { User } from '../../core/schemas/user.schema';

@Injectable()
export class BadgesQueryService {
	constructor(
		@InjectModel(Badge.name) protected badgeModel: Model<BadgeDocument>,
		protected partnerResourceService: PartnerResourcesService,
	) { }
	logger = new Logger(BadgesQueryService.name);

	async getBadges(
		filter: FilterQuery<BadgeDocument>,
		options: QueryOptions<BadgeDocument>,
	): Promise<{ data: BadgeDto[]; count: number }> {
		filter.state = AchievementState.achieved;
		const dataPromise = this.badgeModel.find(filter, {}, options);
		const countPromise = this.badgeModel.count(filter);

		const [data, count] = await Promise.all([dataPromise, countPromise]);
		return {
			data,
			count,
		};
	}

	private buildQueryOption(filter: UserBadgesFilter) {
		const options: QueryOptions<BadgeDocument> = filter.getMongoQueryOptions();

		const sorting: QueryOptions<BadgeDocument> = {};
		if (!!filter.sortBy && !!filter.sortOrder) {
			sorting[filter.sortBy] = filter.sortOrder;
			options.sort = sorting;
		}

		return options;
	}

	async getUserBadges(userBadgesFilter: UserBadgesFilter, user: User) {
		const privacyFilter = userResourceEntityPrivacyFilter(user);
		const query: FilterQuery<BadgeDocument> = {
			$and: [
				userBadgesFilter.getQuery(),
				privacyFilter,
				// Only show badges that are achieved or in progress but that are obtainable
				{ curator_orcid: user.orcid_id },
				{
					$or: [
						{ state: AchievementState.achieved },
						{
							state: AchievementState.progress,
							$or: [
								{ endDate: { $exists: false } },
								{ endDate: { $gt: new Date() } },
							],
						},
					],
				},
			],
		};
		const options = this.buildQueryOption(userBadgesFilter);

		const dataPromise = this.badgeModel.find(query, null, options);
		const countPromise = this.badgeModel.count(query);

		const [data, count] = await Promise.all([dataPromise, countPromise]);
		return {
			data,
			count,
		};
	}
}
