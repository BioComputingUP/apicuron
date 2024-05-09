import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
	WeeklyStatistics,
	WeeklyStatisticsDocument,
} from '../../core/schemas/statistics/weekly-statistics.schema';
import { FilterQuery, Model, QueryOptions } from 'mongoose';
import { paginate } from '../../pagination/paginator';

@Injectable()
export class WeeklyStatisticsService {
	constructor(
		@InjectModel(WeeklyStatistics.name)
		protected WeeklyStatistics: Model<WeeklyStatisticsDocument>,
	) {}

	async getUserWeeklyStatistics(
		filter: FilterQuery<WeeklyStatisticsDocument> = {},
	) {
		return await this.WeeklyStatistics.findOne(filter);
	}

	async getWeeklyLeaderboard(
		filter: FilterQuery<WeeklyStatisticsDocument> = {},
		queryOptions: QueryOptions,
	) {
		const [data, count] = await Promise.all([
			this.WeeklyStatistics.find(filter, null, queryOptions),
			this.WeeklyStatistics.count(filter),
		]);

		return { data, count };
	}
}
