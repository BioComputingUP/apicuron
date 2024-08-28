import { Controller, Get, Param } from '@nestjs/common';
import { DetailedStatisticsService } from '../services/detailed-statistics.service';
import {
	DetailedStatisticsDto,
	DetailedStatisticsFilter,
} from '../dto/detailedStatistics.dto';
import { AuthProtected } from '../../auth/decorators/auth.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { User } from '../../core/schemas/user.schema';
import { UserReq } from '../../auth/decorators/applyUser.decorator';
import { userResourceEntityPrivacyFilter } from '../../util/privacy.helper';
import { VersionHeader } from '../../plugins/swagger/config';
import {
	ApiTags,
	ApiHeader,
	ApiOkResponse,
	ApiOperation,
} from '@nestjs/swagger';
import { DetailedStatistics } from '../../core/schemas/statistics/detailed-statistics.schema';
import { ApiResponseWrapped } from '../../shared/decorators/wrapped-data-response.decorator';
import { plainToClass } from 'class-transformer';

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
		@Param() filter: DetailedStatisticsFilter,
		@UserReq() user: User | null,
	) {
		const privacyFilter = userResourceEntityPrivacyFilter(user);
		const data = await this.detailedStatisticsService.getDetailedStatistics(
			filter,
			privacyFilter,
		);

		return { data: plainToClass(DetailedStatisticsDto, data) };
	}
}
