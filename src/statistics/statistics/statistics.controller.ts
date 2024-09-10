import {
	Controller,
	Get,
	Logger,
	Query,
	Param,
	Res,
	UseInterceptors,
	UseGuards,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { ParseUnsignedIntPipe } from '../../shared/pipes/unsigned-int-validation.pipe';
import { TransformInterceptor } from '../../shared/transformer/transform.interceptor';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import { GetStatisticsDto } from '../dto/get-statistics.dto';
import { StatisticsService } from '../statistics.service';
import {
	ApiHeader,
	ApiOkResponse,
	ApiOperation,
	ApiQuery,
	ApiTags,
} from '@nestjs/swagger';
import { VersionHeader } from '../../plugins/swagger/config';
import { UsersService } from '../../auth/users/services/users.service';
import { Response } from 'express';
import { plainToInstance } from 'class-transformer';
import {
	BasePaginationDto,
	PaginationDto,
} from '../../pagination/dto/paginate.dto';
import { Public } from '../../auth/decorators/public.decorator';
import { LocalAuthGuard } from '../../auth/guards/local-auth.guard';
import { UserReq } from '../../auth/decorators/applyUser.decorator';
import { User } from '../../core/schemas/user.schema';
import { StatisticsFilter } from '../dto/statistics-filter.dto';
import { AuthProtected } from '../../auth/decorators/auth.decorator';
import { userResourceEntityPrivacyFilter } from '../../util/privacy.helper';
import { ValidationError, validate } from 'class-validator';
import { paginate } from '../../pagination/paginator';
import { mapValues, uniq, map, keyBy } from 'lodash';
import { StatLeaderboardDto } from '../dto/statistics.dto';
import { ApiResponsePaginated } from '../../pagination/decorators/paginated-reponse.decorator';
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
		protected userService: UsersService,
	) {}

	private readonly logger = new Logger(StatisticsController.name);

	// @ApiOperation({
	// 	summary:
	// 		'Get a paginated list of user statistics sorted by their score representing the resource leaderboard',
	// })
	@ApiResponsePaginated(
		StatLeaderboardDto,
		200,
		'Paginated list of user statistics',
	)
	// @ApiQuery({ name: 'skip', type: Number, required: false })
	// @ApiQuery({ name: 'limit', type: Number, required: false })
	@AuthProtected()
	@Public()
	@Get(':resource_id/leaderboard')
	async getResourceLeaderboard(
		@Query() pagination: BasePaginationDto,
		@Param('resource_id') resource_id: string,
		@UserReq() user: User | null,
	) {
		const resource = await this.partnerResourceService.get_resource(
			resource_id,
		);
		if (!resource) {
			throw new NotFoundException(`Resource ${resource_id} Not found !`);
		}

		const privacyFilter = userResourceEntityPrivacyFilter(user);

		const filter = {
			resource_id,
			...privacyFilter,
		};

		const { data, count } = await this.statService.getResourceLeaderboard(
			filter,
			pagination.getMongoQueryOptions(),
		);
		const paginated = paginate<StatLeaderboardDto>(data, pagination, count);

		return paginated;
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
		const exists = await this.userService.userExists(orcid_id);
		// if the user doesn't exist we reply with 404
		if (!exists) {
			throw new NotFoundException(`User with orcid id:${orcid_id} not found `);
		}

		const statFilter = new StatisticsFilter();
		statFilter.curator_orcid = orcid_id;

		const errors = await validate(statFilter);

		if (errors.length > 0) {
			const errorResponse = errors.map((error: ValidationError) => ({
				property: error.property,
				message: error.constraints[Object.keys(error.constraints)[0]],
			}));
			throw new BadRequestException(errorResponse);
		}

		const privacyFilter = userResourceEntityPrivacyFilter(user);

		const stats = await this.statService.getUserStatistics(
			{
				...statFilter.omitPagination(),
				...privacyFilter,
			},
			statFilter.getMongoQueryOptions(),
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

		const privacyFilter = userResourceEntityPrivacyFilter(user);

		const { data, count } = await this.statService.get_all_statistics(
			getStatDtoInstance,
			privacyFilter,
		);

		return paginate(data, getStatDtoInstance, count);
	}
}

@ApiTags('First Version')
@Controller()
export class OldStatisticsController {
	constructor(
		protected statService: StatisticsService,
		protected userService: UsersService,
	) {}

	@AuthProtected()
	@Public()
	@Get('/leaderboards')
	async leaderboard(
		@Query('resource') resource_id: string,
		@Query('page', ParseUnsignedIntPipe) page: number,
		@Query('page_size', ParseUnsignedIntPipe) page_size: number,
		@UserReq() user: User | null,
		@Res() res: Response,
	) {
		const pagination = new BasePaginationDto();
		pagination.limit = page_size;
		pagination.skip = (page - 1) * pagination.limit;

		const privacyFilter = userResourceEntityPrivacyFilter(user);
		const { data, count } = await this.statService.getResourceLeaderboard(
			{ resource_id, ...privacyFilter },
			// in the old version, the pages are 0 indexed
			pagination.getMongoQueryOptions(),
		);

		const { meta } = paginate(data, pagination, count);

		const orcid_list = uniq(map(data, 'curator_orcid'));
		const user_list_promises = orcid_list.map((orcid) =>
			this.userService.getByOrcid(orcid),
		);
		const user_list = await Promise.all(user_list_promises);
		const orcid_to_user = keyBy(user_list, 'orcid_id');

		const orcid_to_names = mapValues(orcid_to_user, ({ displayedName }) => {
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
