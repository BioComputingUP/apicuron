import {
	Controller,
	Get,
	Logger,
	Query,
	Param, UseInterceptors,
	UseGuards,
	NotFoundException,
	BadRequestException,
	SerializeOptions
} from '@nestjs/common';
import { TransformInterceptor } from '../../shared/transformer/transform.interceptor';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import { GetStatisticsDto } from '../dto/get-statistics.dto';
import { StatisticsService } from '../statistics.service';
import {
	ApiHeader,
	ApiOkResponse,
	ApiOperation, ApiTags
} from '@nestjs/swagger';
import { VersionHeader } from '../../plugins/swagger/config';
import { UsersService } from '../../auth/users/services/users.service';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import {
	BasePaginationDto
} from '../../pagination/dto/paginate.dto';
import { Public } from '../../auth/decorators/public.decorator';
import { LocalAuthGuard } from '../../auth/guards/local-auth.guard';
import { UserReq } from '../../auth/decorators/applyUser.decorator';
import { User } from '../../core/schemas/user.schema';
import { StatisticsFilter } from '../dto/statistics-filter.dto';
import { AuthProtected } from '../../auth/decorators/auth.decorator';
import { userResourceEntityPrivacyFilter } from '../../util/privacy.helper';
import { ValidationError, validate } from 'class-validator';
import { paginate, Paginated } from '../../pagination/paginator';
import { StatisticsDto, StatLeaderboardDto } from '../dto/statistics.dto';
import { ApiResponsePaginated } from '../../pagination/decorators/paginated-reponse.decorator';
import { StatSearchResponseDto } from '../dto/stat-search-response.dto';
import { ApiResponseWrapped } from '../../shared/decorators/wrapped-data-response.decorator';
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
	) { }

	private readonly logger = new Logger(StatisticsController.name);

	@ApiResponsePaginated(
		StatLeaderboardDto,
		200,
		'Paginated list of user statistics',
	)
	@AuthProtected()
	@Public()
	@Get(':resource_id/leaderboard')
	@SerializeOptions({ type: Paginated<StatLeaderboardDto> })
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
		const paginated = paginate<StatLeaderboardDto>(StatLeaderboardDto, data, pagination, count);


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
	): Promise<StatisticsDto[]> {
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
		const deserializedData = stats.map((stat) => {
			return plainToInstance(StatisticsDto, stat, {
				excludeExtraneousValues: true,
				enableCircularCheck: true,
			});
		});
		return deserializedData;
	}

	@ApiOperation({
		summary: 'Get Multiple statistics regarding multiple users',
	})
	@ApiResponsePaginated(
		StatSearchResponseDto,
		200,
		'List of aggregated user statistics regarding each Partner Resource they contributed in',
	)
	@AuthProtected()
	@SerializeOptions({ type: Paginated<StatSearchResponseDto> })
	@Public()
	@Get()
	async findAll(
		@Query() query: GetStatisticsDto,
		@UserReq() user?: User,
	): Promise<Paginated<StatSearchResponseDto>> {
		const getStatDtoInstance = plainToInstance(GetStatisticsDto, query);

		const privacyFilter = userResourceEntityPrivacyFilter(user);

		const { data, count } = await this.statService.get_all_statistics(
			getStatDtoInstance,
			privacyFilter,
		);


		return paginate<StatSearchResponseDto>(
			StatSearchResponseDto,
			data,
			getStatDtoInstance,
			count,
		);
	}

	@ApiOperation({
		summary: 'Get a list of the user statistics for a specific resource',
	})
	@ApiResponseWrapped(
		StatisticsDto,
		200,
		'A list of the user statistics for a specific resource',
	)
	@AuthProtected()
	@Public()
	@Get('/resources/:resource_id/user/:orcid_id')
	async getResourceUserStatistics(
		@Param('resource_id') resource_id: string,
		@Param('orcid_id') curator_orcid: string,
		@UserReq() user: User,
	): Promise<StatisticsDto[]> {
		return await this.statService.getResourceUserStatistics(
			resource_id,
			curator_orcid,
			user,
		);
	}
}
