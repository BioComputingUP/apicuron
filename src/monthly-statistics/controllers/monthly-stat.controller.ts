import {
	Controller,
	Get,
	NotFoundException,
	Param,
	Query,
	SerializeOptions,
} from '@nestjs/common';
import { VersionHeader } from '../../plugins/swagger/config';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MonthlyLeaderboardDto } from '../dto';
import { MonthlyStatisticsService } from '../services/monthly-stat.service';
import { UserReq } from '../../auth/decorators/applyUser.decorator';
import { AuthProtected } from '../../auth/decorators/auth.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { ApiResponsePaginated } from '../../pagination/decorators/paginated-reponse.decorator';
import { BasePaginationDto } from '../../pagination/dto/paginate.dto';
import { Paginated } from '../../pagination/paginator';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import { User } from '../../core/schemas/user.schema';

@ApiTags('Monthly Statistics')
@ApiHeader(VersionHeader)
@Controller({
	path: 'monthly-statistics',
})
export class MonthlyStatisticsController {
	constructor(
		protected monthlyStatisticsService: MonthlyStatisticsService,
		protected resourceService: PartnerResourcesService,
	) {}

	@ApiOperation({
		summary: 'Leaderboard for the last week',
		description:
			'This endpoint is used to get the weekly leaderboard for a given resource.',
	})
	@ApiResponsePaginated(
		MonthlyLeaderboardDto,
		200,
		'The weekly leaderboard for the given resource',
	)
	@AuthProtected()
	@Public()
	@Get(':resource_id/leaderboard')
	@SerializeOptions({ type: Paginated<MonthlyLeaderboardDto> })
	async getWeeklyLeaderboard(
		@Param('resource_id') resource_id: string,
		@Query() pagination: BasePaginationDto,
		@UserReq() user: User | null,
	): Promise<Paginated<MonthlyLeaderboardDto>> {
		const exists = await this.resourceService.exists(resource_id);
		if (!exists) {
			throw new NotFoundException(`Resource ${resource_id} not found`);
		}

		const leaderboard: Paginated<MonthlyLeaderboardDto> =
			await this.monthlyStatisticsService.getLeaderboard(
				resource_id,
				pagination,
				user,
			);

		return leaderboard;
	}
}
