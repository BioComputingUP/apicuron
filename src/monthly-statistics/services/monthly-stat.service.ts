import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
	MonthlyStatistics,
	MonthlyStatisticsDocument,
} from '../../core/schemas/statistics/monthly-statistics.schema';
import { FilterQuery, Model } from 'mongoose';
import { MonthlyLeaderboardDto } from '../dto';
import { getMonthEnd, getMonthStart, TIMEZONE } from '../../util/date.helper';
import * as moment from 'moment';
import { UsersService } from '../../auth/users/services/users.service';
import { plainToInstance } from 'class-transformer';
import { User } from '../../core/schemas/user.schema';
import { BasePaginationDto } from '../../pagination/dto/paginate.dto';
import { userResourceEntityPrivacyFilter } from '../../util/privacy.helper';
import { paginate, Paginated } from '../../pagination/paginator';

@Injectable()
export class MonthlyStatisticsService {
	constructor(
		@InjectModel(MonthlyStatistics.name)
		protected monthlyStatModel: Model<MonthlyStatisticsDocument>,
		protected userService: UsersService,
	) {}

	async getLeaderboard(
		resource_id: string,
		paginationDto: BasePaginationDto,
		user: User | null = null,
	): Promise<Paginated<MonthlyLeaderboardDto>> {
		const privacyFilter = userResourceEntityPrivacyFilter(user);

		const filter: FilterQuery<MonthlyStatisticsDocument> = {
			$and: [
				privacyFilter,
				{
					resource_id,
					monthStart: getMonthStart(moment().tz(TIMEZONE)),
					monthEnd: getMonthEnd(moment().tz(TIMEZONE)),
				},
			],
		};
		const [statistics, count] = await Promise.all([
			this.monthlyStatModel.find(filter, null, {
				...paginationDto.getMongoQueryOptions(),
				sort: { total_score: -1 },
			}),
			this.monthlyStatModel.count(filter),
		]);

		const orcid_ids = statistics.map((stat) => stat.curator_orcid);
		const users = await this.userService.getUsersByOrcid(orcid_ids);

		const statLeaderboard = statistics.map((stat, index) => {
			const user = users[index];
			const leaderboardEntry = plainToInstance(
				MonthlyLeaderboardDto,
				{ stat, user },
				{ excludeExtraneousValues: true },
			);

			return leaderboardEntry;
		});

		return paginate<MonthlyLeaderboardDto>(
			statLeaderboard,
			paginationDto,
			count,
		);
	}
}
