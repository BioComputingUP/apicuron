import {
	Controller,
	Get,
	NotFoundException,
	Param,
	Query,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { VersionHeader } from '../../swagger/config';
import { WeeklyStatisticsFilter } from '../dto/weekly-statistics-filter';
import { UserReq } from '../../auth/decorators/applyUser.decorator';
import { AuthProtected } from '../../auth/decorators/auth.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { userResourceEntityPrivacyFilter } from '../../util/privacy.helper';
import { WeeklyStatisticsService } from '../services/weekly-statistics.service';
import { User } from '../../core/schemas/user.schema';
import { PaginateDto } from '../../pagination/dto/paginate.dto';
import { paginate } from '../../pagination/paginator';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';

@ApiTags('Weekly Statistics')
@ApiHeader(VersionHeader)
@Controller({
	path: 'weekly-statistics',
})
export class WeeklyStatisticsController {
	constructor(
		protected weeklyStatisticsService: WeeklyStatisticsService,
		protected resourceService: PartnerResourcesService,
	) {}

	@ApiOperation({
		summary: 'Leaderboard for the last week',
		description:
			'This endpoint is used to get the weekly leaderboard for a given resource.',
	})
	@AuthProtected()
	@Public()
	@Get(':resource_id/leaderboard')
	async getWeeklyLeaderboard(
		@Param('resource_id') resource_id: string,
		@Query() pagination: PaginateDto,
		@UserReq() user: User | null,
	) {
		const exists = await this.resourceService.exists(resource_id);
		if (!exists) {
			throw new NotFoundException(`Resource ${resource_id} not found`);
		}

		const privacyFilter = userResourceEntityPrivacyFilter(user);

		const { data, count } =
			await this.weeklyStatisticsService.getWeeklyLeaderboard(
				{
					$and: [privacyFilter, { resource_id }],
				},
				pagination.getMongoQueryOptions(),
			);

		return paginate(data, pagination, count);
	}

	@ApiOperation({
		summary: "Last week's user statistics",
		description:
			'This endpoint is used to get the weekly statistics for a given curator at a given resource while belonging in a specific league.',
	})
	@AuthProtected()
	@Public()
	@Get(':resource_id/:curator_orcid/:league')
	async getWeeklyStatistics(
		@Param() statFilter: WeeklyStatisticsFilter,
		@UserReq() user: User | null,
	) {
		const privacyFilter = userResourceEntityPrivacyFilter(user);
		return await this.weeklyStatisticsService.getUserWeeklyStatistics({
			$and: [statFilter, privacyFilter],
		});
	}
}
