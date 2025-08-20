import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import * as moment from 'moment-timezone';
import { FilterQuery, QueryOptions } from 'mongoose';
import { User } from 'src/core/schemas';
import { UsersService } from '../../auth/users/services/users.service';
import {
	WeeklyStatistics,
	WeeklyStatisticsDocument,
	WeeklyStatisticsFilter,
	WeeklyStatisticsModel,
} from '../../core/schemas/statistics/weekly-statistics.schema';
import { getWeekEnd, getWeekStart, TIMEZONE } from '../../util/date.helper';
import { WeeklyStatisticsDto } from '../dto/weekly-statistics.dto';

@Injectable()
export class WeeklyStatisticsService {
	constructor(
		@InjectModel(WeeklyStatistics.name)
		protected WeeklyStatistics: WeeklyStatisticsModel,
		protected userService: UsersService,
	) {}

	async getUserWeeklyStatistics(
		filter: FilterQuery<WeeklyStatisticsDocument> = {},
	) {
		const stat = await this.WeeklyStatistics.findOne(filter);

		return plainToInstance(WeeklyStatisticsDto, stat);
	}

	async getWeeklyLeaderboard(
		filter: WeeklyStatisticsFilter = {},
		queryOptions: QueryOptions,
	): Promise<{
		data: {
			stat: WeeklyStatistics;
			user: User | null;
		}[];
		count: number;
	}> {
		const statFilter = {
			$and: [
				filter,
				{
					weekStart: getWeekStart(moment().tz(TIMEZONE)),
					weekEnd: getWeekEnd(moment().tz(TIMEZONE)),
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

		const statLeaderboard: { stat: WeeklyStatistics; user: User | null }[] =
			statistics.map((stat) => {
				const leaderboardEntry = {
					stat: stat.toObject(),
					user: stat.user?.toObject<User>() ?? null,
				};

				return leaderboardEntry;
			});

		return { data: statLeaderboard, count };
	}
}
