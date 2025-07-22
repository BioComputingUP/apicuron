import {
	Controller,
	Get,
	NotFoundException,
	Param,
	Query,
	SerializeOptions
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserReq } from '../../auth/decorators/applyUser.decorator';
import { AuthProtected } from '../../auth/decorators/auth.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { User } from '../../core/schemas/user.schema';
import { ApiResponsePaginated } from '../../pagination/decorators/paginated-reponse.decorator';
import { BasePaginationDto } from '../../pagination/dto/paginate.dto';
import { paginate, Paginated } from '../../pagination/paginator';
import { VersionHeader } from '../../plugins/swagger/config';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import { ApiResponseWrapped } from '../../shared/decorators/wrapped-data-response.decorator';
import { userResourceEntityPrivacyFilter } from '../../util/privacy.helper';
import { WeeklyStatisticsFilter } from '../dto/weekly-statistics-filter';
import {
	WeeklyLeaderboardDto,
	WeeklyStatisticsDto
} from '../dto/weekly-statistics.dto';
import { WeeklyStatisticsService } from '../services/weekly-statistics.service';

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
	@ApiResponsePaginated(
		WeeklyLeaderboardDto,
		200,
		'The weekly leaderboard for the given resource',
	)
	@AuthProtected()
	@Public()
	// eslint-disable-next-line prettier/prettier
	@SerializeOptions({ type: Paginated<WeeklyLeaderboardDto> })
	@Get(':resource_id/leaderboard')
	async getWeeklyLeaderboard(
		@Param('resource_id') resource_id: string,
		@Query() pagination: BasePaginationDto,
		@UserReq() user: User | null,
	): Promise<Paginated<WeeklyLeaderboardDto>> {
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

		return paginate<WeeklyLeaderboardDto>(WeeklyLeaderboardDto, data, pagination, count);
	}

	@ApiOperation({
		summary: "Last week's user statistics",
		description:
			'This endpoint is used to get the weekly statistics for a given curator at a given resource while belonging in a specific league.',
	})
	@ApiResponseWrapped(
		WeeklyStatisticsDto,
		200,
		'The weekly statistics for the given user for a specific resource and league',
	)
	@AuthProtected()
	@Public()
	@Get(':resource_id/:curator_orcid/:league')
	async getWeeklyStatistics(
		@Param() statFilter: WeeklyStatisticsFilter,
		@UserReq() user: User | null,
	) {
		const privacyFilter = userResourceEntityPrivacyFilter(user);
		const data = await this.weeklyStatisticsService.getUserWeeklyStatistics({
			$and: [statFilter, privacyFilter],
		});

		return { data };
	}
}
