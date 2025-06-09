import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import * as moment from 'moment-timezone';
import { FilterQuery, LeanDocument, Model, QueryOptions } from 'mongoose';
import { UserDocument } from 'src/core/schemas';
import { UsersService } from '../../auth/users/services/users.service';
import {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	WeeklyStatistics,
	WeeklyStatisticsDocument,
} from '../../core/schemas/statistics/weekly-statistics.schema';
import { getWeekEnd, getWeekStart, TIMEZONE } from '../../util/date.helper';
import { WeeklyStatisticsDto } from '../dto/weekly-statistics.dto';

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
	): Promise<{
		data: {
			stat: LeanDocument<WeeklyStatisticsDocument>;
			user: LeanDocument<UserDocument>;
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

		const orcid_ids = statistics.map((stat) => stat.curator_orcid);
		const users = await this.userService.getUsersByOrcid(orcid_ids);

		const statLeaderboard = statistics.map((stat, index) => {
			const user: UserDocument = users[index];
			const leaderboardEntry = { stat: stat.toObject(), user: user.toObject() };

			return leaderboardEntry;
		});

		return { data: statLeaderboard, count };
	}
}
