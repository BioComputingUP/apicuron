import {
	Controller,
	Get,
	Logger,
	Query,
	Param,
	Res,
	Req,
	UseInterceptors,
	UseGuards,
	NotFoundException,
} from '@nestjs/common';
import { AchievementsService } from '../../achievements/achievements.service';
import { ParseUnsignedIntPipe } from '../../shared/pipes/unsigned-int-validation.pipe';
import { TransformInterceptor } from '../../shared/transformer/transform.interceptor';
import { PartnerResourcesService } from '../../resources/partner-resources/partner-resources.service';
import { FilterField, GetStatisticsDto } from '../dto/get-statistics.dto';
import { StatisticsService } from '../statistics.service';
import {
	ApiHeader,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';
import { VersionHeader } from '../../swagger/config';
import { UsersService } from '../../auth/users/users.service';
import * as _ from 'lodash';
import { Response } from 'express';
import { plainToInstance } from 'class-transformer';
// import { paginate } from '../../pagination/paginator';
import { PaginateDto } from '../../pagination/dto/paginate.dto';
import { Public } from '../../auth/decorators/public.decorator';
import { LocalAuthGuard } from '../../auth/guards/local-auth.guard';
import { UserReq } from '../../auth/decorators/applyUser.decorator';
import { User } from '../../core/schemas/user.schema';
import { StatisticsFilter } from '../dto/statistics-filter.dto';

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
		protected userService: UsersService,
	) {}

	private readonly logger = new Logger(StatisticsController.name);

	@ApiOperation({
		summary:
			'Get a paginated list of user statistics sorted by their score representing the resource leaderboard',
	})
	@ApiOkResponse({
		description:
			'A paginated list of user statistics sorted by the highest score to the lowest',
	})
	@UseGuards(LocalAuthGuard)
	@Public()
	@Get('leaderboard/:resource_id')
	async get_resource_leaderboard(
		@Param('resource_id') resource_id: string,
		@Query() pagination: PaginateDto,
		@Req() req: any,
	) {
		const resourceExists = await this.partnerResourceService.exists(
			resource_id,
		);
		if (!resourceExists) {
			throw new NotFoundException(`Resource ${resource_id} Not found !`);
		}

		if (req.user) {
			// user is loggedIn
			// check for resource ownership

			if (!!req.user.resources.find((res) => res.resource_id == resource_id)) {
				return this.statService.getResourceLeaderboard(resource_id, pagination);
			}
		}

		return await this.statService.getPublicResourceLeaderboard(
			resource_id,
			pagination,
		);
	}

	@ApiOkResponse({
		description:
			'List of aggregated user statistics regarding each Partner Resource they contributed in',
	})
	@ApiOperation({
		summary:
			'get a single user statistics for all the Partner Resources they are concerned by',
	})
	@UseGuards(LocalAuthGuard)
	@Public()
	@Get('user/:orcid_id')
	async get_user_statistics(
		@Param('orcid_id') orcid_id: string,
		@UserReq() user: User,
	) {
		const exists = await this.userService.user_exists(orcid_id);
		// if the user doesn't exist we reply with 404
		if (!exists) {
			throw new NotFoundException(`User with orcid id:${orcid_id} not found `);
		}

		const statFilter = new StatisticsFilter();
		statFilter.curator_orcid = orcid_id;

		const stats = await this.statService.getStatistics(
			statFilter,
			user?.resources.map((res) => res.resource_id) ?? [],
		);

		return stats;
	}

	@ApiOperation({
		summary: 'Get Multiple statistics regarding multiple users',
	})
	@ApiOkResponse({
		description:
			'List of aggregated user statistics regarding each Partner Resource they contributed in',
	})
	@UseGuards(LocalAuthGuard)
	@Public()
	@Get()
	async findAll(@Query() query: GetStatisticsDto, @UserReq() user?: User) {
		const getStatDtoInstance = plainToInstance(GetStatisticsDto, query);
		return await this.statService.get_all_statistics(
			getStatDtoInstance,
			user?.resources.map((res) => res.resource_id),
			'public',
		);
	}
}

@ApiTags('First Version')
@Controller()
export class OldStatisticsController {
	constructor(
		protected statService: StatisticsService,
		protected userService: UsersService,
	) {}

	@Get('/leaderboards')
	async leaderboard(
		@Query('resource') resource_id: string,
		@Query('page', ParseUnsignedIntPipe) page: number,
		@Query('page_size', ParseUnsignedIntPipe) page_size: number,
		@Res() res: Response,
	) {
		const pagination = new PaginateDto();
		pagination.limit = page_size;
		pagination.skip = (page - 1) * pagination.limit;

		const { data, meta } = await this.statService.getResourceLeaderboard(
			resource_id,
			// in the old version, the pages are 0 indexed
			pagination,
		);

		const orcid_list = _.uniq(_.map(data, 'curator_orcid'));
		const user_list_promises = orcid_list.map((orcid) =>
			this.userService.get_by_orcid(orcid),
		);
		const user_list = await Promise.all(user_list_promises);
		const orcid_to_user = _.keyBy(user_list, 'orcid_id');

		const orcid_to_names = _.mapValues(orcid_to_user, ({ displayedName }) => {
			const [given_name, family_name] = displayedName.split(' ');
			return {
				given_name,
				family_name,
			};
		});
		const leaderboard = data.map((stat) => {
			return {
				...stat,
				...orcid_to_names[stat['curator_orcid']],
			};
		});
		res.setHeader('count', String(meta.pagination.total));
		res.send(leaderboard);
		// return 	leaderboard
	}
}
