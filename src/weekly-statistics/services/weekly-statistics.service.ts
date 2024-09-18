import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
	WeeklyStatistics,
	WeeklyStatisticsDocument,
} from '../../core/schemas/statistics/weekly-statistics.schema';
import { FilterQuery, Model, QueryOptions } from 'mongoose';
import { plainToInstance } from 'class-transformer';
import {
	WeeklyLeaderboardDto,
	WeeklyStatisticsDto,
} from '../dto/weekly-statistics.dto';
import { UsersService } from '../../auth/users/services/users.service';
import { getWeekEndUTC, getWeekStartUTC } from '../helpers/fields-updater';
import * as moment from 'moment-timezone';
import { TIMEZONE } from '../constants/start-of-week';

@Injectable()
export class WeeklyStatisticsService {
	constructor(
		@InjectModel(WeeklyStatistics.name)
		protected WeeklyStatistics: Model<WeeklyStatisticsDocument>,
		protected userService: UsersService,
	) {}

	async getUserWeeklyStatistics(
		filter: FilterQuery<WeeklyStatisticsDocument> = {},
	) {
		const stat = await this.WeeklyStatistics.findOne(filter);

		return plainToInstance(WeeklyStatisticsDto, stat);
	}

	async getWeeklyLeaderboard(
		filter: FilterQuery<WeeklyStatisticsDocument> = {},
		queryOptions: QueryOptions,
	): Promise<{ data: WeeklyLeaderboardDto[]; count: number }> {
		const statFilter = {
			$and: [
				filter,
				{
					weekStart: getWeekStartUTC(moment().tz(TIMEZONE)),
					weekEnd: getWeekEndUTC(moment().tz(TIMEZONE)),
				},
			],
		};
		const [statistics, count] = await Promise.all([
			this.WeeklyStatistics.find(statFilter, null, {
				...queryOptions,
				sort: { total_score: -1 },
			}),
			this.WeeklyStatistics.count(statFilter),
		]);

		const orcid_ids = statistics.map((stat) => stat.curator_orcid);
		const users = await this.userService.getUsersByOrcid(orcid_ids);

		const statLeaderboard = statistics.map((stat, index) => {
			const user = users[index];
			const leaderboardEntry = plainToInstance(
				WeeklyLeaderboardDto,
				{ stat, user },
				{ excludeExtraneousValues: true },
			);

			return leaderboardEntry;
		});

		return { data: statLeaderboard, count };
	}
}
