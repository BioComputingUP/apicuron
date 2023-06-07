import {
	Controller,
	Get,
	Logger,
	Query,
	Param,
	Res,
	Req,
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
import { VersionHeader } from '../../swagger/config';
import { UsersService } from '../../auth/users/users.service';
import * as _ from 'lodash';
import { Request, Response } from 'express';

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
	async get_user_statistics(@Param('orcid_id') orcid_id:string, @Req() req){
		if(!req.user){
			return await this.statService.get_public_user_statistics(orcid_id)
		}
		const resource_ids = (req.user.resources || []).map(res => res.resource_id)
		return await this.statService.get_all_user_statistics(orcid_id, resource_ids)

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

	constructor(protected statService: StatisticsService, protected userService: UsersService) {}

	@Get('/leaderboards')
	async leaderboard(
		@Query('resource') resource_id: string,
		@Query('page', ParseUnsignedIntPipe) page: number,
		@Query('page_size', ParseUnsignedIntPipe) page_size: number,
		@Res() res: Response
	){
		const { data, count } = await this.statService.get_resource_leaderboard(
			resource_id,
			// in the old version, the pages are 0 indexed
			page + 1,
			page_size,
		);
		
		const orcid_list = _.uniq(_.map(data, 'curator_orcid'))
		const user_list_promises = orcid_list.map(orcid => this.userService.get_by_orcid(orcid))
		const user_list = await Promise.all(user_list_promises)
		const orcid_to_user = _.keyBy(user_list, 'orcid_id')

		const orcid_to_names = _.mapValues(orcid_to_user, ({ displayedName }) => {
			const [given_name, family_name] = displayedName.split(' ')
			return {
				given_name,
				family_name
			}
		})
		const leaderboard = data.map((stat) => {
			return {
				...stat,
				...orcid_to_names[stat.curator_orcid]
			}
		})
		res.setHeader('count', String(count))
		res.send(leaderboard)
		// return 	leaderboard
	}
}