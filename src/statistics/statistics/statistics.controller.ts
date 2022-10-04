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
import { TransformerService } from '../../shared/transformer/transformer.service';
import { PartnerResourcesService } from '../../resources/partner-resources/partner-resources.service';
import { GetStatisticsDto } from '../dto/get-statistics.dto';
import { StatisticsService } from '../statistics.service';

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
		protected transformerService: TransformerService,
	) {}

	private readonly logger = new Logger(StatisticsController.name);


	@Get('leaderboard/:resource_id')
	async get_resource_leaderboard(
		@Param('resource_id') resource_id: string,
		@Query('page', ParseUnsignedIntPipe) page: number,
		@Query('page_size', ParseUnsignedIntPipe) page_size: number,
	) {
		// if(!!page && typeof page == 'string'){
		// 	page = parseInt(page)
		// }
		// if(!!page_size && typeof page_size == 'string') {
		// 	page_size = parseInt(page)
		// }
		return await this.statService.get_resource_leaderboard(
			resource_id,
			page,
			page_size,
		);
	}

	@Get('achievements/:orcid_id/:resource_id')
	async get_user_achievements(@Param('orcid_id') orcid_id: string, @Param('resource_id') resource_id: string){
		const { resource_uri } = await this.partnerResourceService.get_resource(resource_id)
		
		return this.achievementsService.user_achievements(orcid_id, resource_uri)
	}

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
