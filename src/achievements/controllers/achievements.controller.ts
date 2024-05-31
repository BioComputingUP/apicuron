import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { VersionHeader } from '../../swagger/config';
import { AchievementsService } from '../achievements.service';
import { AchievementSelectDto } from '../dto/achievements.dto';
import { AchievementFilter } from '../dto/achievement-filter.dto';
import { Public } from '../../auth/decorators/public.decorator';
import { AuthProtected } from '../../auth/decorators/auth.decorator';
import { UserReq } from '../../auth/decorators/applyUser.decorator';
import { userResourceEntityPrivacyFilter } from '../../util/privacy.helper';
import { paginate } from '../../pagination/paginator';
import { User } from '../../core/schemas/user.schema';
import { plainToInstance } from 'class-transformer';

@ApiTags('Achievements')
@ApiHeader(VersionHeader)
@Controller({
	path: 'achievements',
	version: '2',
})
export class AchievementsController {
	constructor(protected achievementsService: AchievementsService) {}

	@AuthProtected()
	@Public()
	@Get(':orcid_id/:resource_id')
	async get_user_achievements(
		@Param() params: AchievementSelectDto,
		@UserReq() user: User | null,
	) {
		const privacyFilter = userResourceEntityPrivacyFilter(user);
		const { resource_id, orcid_id } = params;
		return this.achievementsService.user_achievements({
			curator_orcid: orcid_id,
			resource_id,
			...privacyFilter,
		});
	}

	@AuthProtected()
	@Public()
	@Get('medals')
	async get_medals(
		@Query() filter: AchievementFilter,
		@UserReq() user: User | null,
	) {
		const privacyFilter = userResourceEntityPrivacyFilter(user);
		const query = {
			...filter.getQuery(),
			...privacyFilter,
		};
		const { data, count } = await this.achievementsService.getMedals(
			query,
			filter.getMongoQueryOptions(),
		);

		return paginate(data, filter, count);
	}

	@AuthProtected()
	@Public()
	@Get('badges')
	async get_badges(
		@Query() filter: AchievementFilter,
		@UserReq() user: User | null,
	) {
		const privacyFilter = userResourceEntityPrivacyFilter(user);
		const query = {
			...filter.getQuery(),
			privacyFilter,
		};

		const { count, data } = await this.achievementsService.getBadges(
			query,
			filter.getMongoQueryOptions(),
		);

		return paginate(data, filter, count);
	}
}
