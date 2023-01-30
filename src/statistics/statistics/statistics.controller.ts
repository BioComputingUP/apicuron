import {
	Controller,
	Get,
	Logger,
	Query,
	Param,
	UseInterceptors,
} from '@nestjs/common';
import { AchievementsService } from '../../achievements/achievements.service';
import { ParseUnsignedIntPipe } from '../../shared/pipes/unsigned-int-validation.pipe';
import { TransformInterceptor } from '../../shared/transformer/transform.interceptor';
// import { TransformerService } from '../../shared/transformer/transformer.service';
import { PartnerResourcesService } from '../../resources/partner-resources/partner-resources.service';
import { GetStatisticsDto } from '../dto/get-statistics.dto';
import { StatisticsService } from '../statistics.service';
import { ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { VersionHeader } from '../../config/swagger';

@ApiTags('Statistics')
@ApiHeader(VersionHeader)
@Controller({
	version: '2',
	path: 'statistics',
})
@UseInterceptors(TransformInterceptor)
export class StatisticsController {
	constructor(
		protected statService: StatisticsService,
		protected partnerResourceService: PartnerResourcesService,
		protected achievementsService: AchievementsService,
		// protected transformerService: TransformerService,
	) {}

	private readonly logger = new Logger(StatisticsController.name);

	@ApiOperation({
		summary: 'Get a paginated list of user statistics sorted by their score representing the resource leaderboard'
	})
	@ApiOkResponse({
		description: 'A paginated list of user statistics sorted by the highest score to the lowest',
	})
	@Get('leaderboard/:resource_id')
	async get_resource_leaderboard(
		@Param('resource_id') resource_id: string,
		@Query('page', ParseUnsignedIntPipe) page: number,
		@Query('page_size', ParseUnsignedIntPipe) page_size: number,
	) {
		return await this.statService.get_resource_leaderboard(
			resource_id,
			page,
			page_size,
		);
	}
	

	
	@ApiOkResponse({
		description: 'List of aggregated user statistics regarding each Partner Resource they contributed in',
	})
	@ApiOperation({
		summary: 'get a single user statistics for all the Partner Resources they are concerned by'
	})
	@Get('user/:orcid_id')
	async get_user_statistics(@Param('orcid_id') orcid_id:string){
		return this.statService.get_user_statistics(orcid_id)
	}

	@ApiOperation({
		summary: 'Get Multiple statistics regarding multiple'
	})
	@ApiOkResponse({
		description: 'List of aggregated user statistics regarding each Partner Resource they contributed in',
	})
	@Get()
	async findAll(@Query() query: GetStatisticsDto) {
		return await this.statService.get_all_statistics(
			query.query,
			query.filter_field,
			query.resources,
			query.page,
			query.page_size,
		);
	}

	
}

@ApiTags('First Version')
@Controller()
export class OldStatisticsController {

	constructor(protected statService: StatisticsService) {}

	@Get('/leaderboards')
	async leaderboard(
		@Query('resource') resource_id: string,
		@Query('page', ParseUnsignedIntPipe) page: number,
		@Query('page_size', ParseUnsignedIntPipe) page_size: number,
	){
		return await this.statService.get_resource_leaderboard(
			resource_id,
			// in the old version, the pages are 0 indexed
			page + 1,
			page_size,
		);	
	}
}