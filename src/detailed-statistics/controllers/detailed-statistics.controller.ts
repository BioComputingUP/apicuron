import { Controller, Get, Param } from '@nestjs/common';
import { DetailedStatisticsService } from '../services/detailed-statistics.service';
import { DetailedStatisticsDto } from '../dto/detailedStatistics.dto';
import {
	DetailedStatisticsFilter,
	DetailedStatisticsIdentifier,
} from '../dto/detailed-stat-filter.dto';
import { AuthProtected } from '../../auth/decorators/auth.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { User } from '../../core/schemas/user.schema';
import { UserReq } from '../../auth/decorators/applyUser.decorator';
import { VersionHeader } from '../../plugins/swagger/config';
import { ApiTags, ApiHeader, ApiOperation } from '@nestjs/swagger';
import { ApiResponseWrapped } from '../../shared/decorators/wrapped-data-response.decorator';

@ApiTags('Detailed Statistics')
@ApiHeader(VersionHeader)
@Controller({
	path: 'detailed-statistics',
})
export class DetailedStatisticsController {
	constructor(protected detailedStatisticsService: DetailedStatisticsService) {}

	@ApiOperation({
		summary: 'Detailed user statistics',
		description:
			'Get a single JSON entry that contains the  for a given curator contributed to a resource in a specific league.',
	})
	@ApiResponseWrapped(
		DetailedStatisticsDto,
		200,
		'Detailed statistics for a given curator contributed to a resource in a specific league.',
	)
	@Get(':resource_id/:curator_orcid/:league')
	@AuthProtected()
	@Public()
	async getDetailedStatistics(
		@Param() identifier: DetailedStatisticsIdentifier,
		@UserReq() user: User | null,
	): Promise<{ data: DetailedStatisticsDto }> {
		const data = await this.detailedStatisticsService.getDetailedStat(
			identifier,
			user,
		);

		return { data };
	}

	@ApiOperation({
		summary: 'Detailed user statistics',
		description:
			'Get a single JSON entry that contains the  for a given curator contributed to a resource in a specific league.',
	})
	@ApiResponseWrapped(
		DetailedStatisticsDto,
		200,
		'Detailed statistics for a given curator contributed to a resource in a specific league.',
	)
	@Get(':resource_id/:curator_orcid')
	@AuthProtected()
	@Public()
	async getUserDetailedStatistics(
		@Param() identifier: DetailedStatisticsFilter,
		@UserReq() user: User | null,
	) {
		const data = await this.detailedStatisticsService.getResourceUserStatistics(
			identifier,
			user,
		);

		return { data };
	}
}
