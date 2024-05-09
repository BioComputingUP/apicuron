import { Injectable } from '@nestjs/common';
import {
	DetailedStatistics,
	DetailedStatisticsDocument,
} from '../../core/schemas/statistics/detailed-statistics.schema';
import { DetailedStatisticsFilter } from '../interfaces/detailed-statistics';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class DetailedStatisticsService {
	constructor(
		@InjectModel(DetailedStatistics.name)
		protected detailedStatsModel: Model<DetailedStatisticsDocument>,
	) {}

	async getDetailedStatistics(
		filter: DetailedStatisticsFilter,
		privacyFilter: FilterQuery<DetailedStatisticsDocument> = {},
	): Promise<DetailedStatisticsDocument | null> {
		return await this.detailedStatsModel.findOne({
			$and: [filter, privacyFilter],
		});
	}
}
