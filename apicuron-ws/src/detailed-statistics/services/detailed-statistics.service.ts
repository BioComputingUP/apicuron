import { Injectable } from '@nestjs/common';
import {
	DetailedStatistics,
	DetailedStatisticsDocument,
} from '../../core/schemas/statistics/detailed-statistics.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { plainToInstance } from 'class-transformer';
import { DetailedStatisticsDto } from '../dto/detailedStatistics.dto';
import { userResourceEntityPrivacyFilter } from '../../util/privacy.helper';
import { User } from '../../core/schemas/user.schema';
import {
	DetailedStatisticsFilter,
	DetailedStatisticsIdentifier,
} from '../dto/detailed-stat-filter.dto';

@Injectable()
export class DetailedStatisticsService {
	constructor(
		@InjectModel(DetailedStatistics.name)
		protected detailedStatsModel: Model<DetailedStatisticsDocument>,
	) {}

	async getDetailedStat(
		filter: DetailedStatisticsIdentifier,
		user?: User,
	): Promise<DetailedStatisticsDto> {
		const privacyFilter = userResourceEntityPrivacyFilter(user);

		const stat = await this.detailedStatsModel.findOne({
			$and: [filter, privacyFilter],
		});
		const serializedStat = plainToInstance(DetailedStatisticsDto, stat, {
			excludeExtraneousValues: true,
			enableCircularCheck: true,
		});
		return serializedStat;
	}

	async getResourceUserStatistics(
		filter: DetailedStatisticsFilter,
		user?: User,
	): Promise<DetailedStatisticsDto[]> {
		const privacyFilter = userResourceEntityPrivacyFilter(user);

		const stats = await this.detailedStatsModel.find({
			$and: [filter, privacyFilter],
		});

		const serializedStats = plainToInstance(DetailedStatisticsDto, stats, {
			excludeExtraneousValues: true,
			enableCircularCheck: true,
		});

		return serializedStats;
	}
}
