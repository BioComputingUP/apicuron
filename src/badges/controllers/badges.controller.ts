import { Controller, Get, Query, SerializeOptions } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { UserReq } from '../../auth/decorators/applyUser.decorator';
import { AuthProtected } from '../../auth/decorators/auth.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { paginate, Paginated } from '../../pagination/paginator';
import { VersionHeader } from '../../plugins/swagger/config';
import { userResourceEntityPrivacyFilter } from '../../util/privacy.helper';
import { User } from '../../core/schemas/user.schema';
import { BadgesQueryService } from '../services/badges-query.service';
import { BadgeFilter, UserBadgesFilter } from '../dto/badge-filter.dto';
import { BadgeDto, PrivateBadgeDto } from '../dto/badge.dto';
import { ApiResponsePaginated } from '../../pagination/decorators/paginated-reponse.decorator';

@ApiTags('Achievements')
@ApiHeader(VersionHeader)
@Controller({
	version: '2',
})
export class BadgesController {
	constructor(protected badgesQueryService: BadgesQueryService) {}

	@ApiResponsePaginated(
		BadgeDto,
		200,
		'A list of badges matching the filter achieved by users',
	)
	@AuthProtected()
	@Public()
	@SerializeOptions({ type: Paginated<BadgeDto> })
	@Get('achievements/badges')
	async get_badges(@Query() filter: BadgeFilter, @UserReq() user: User | null) {
		const privacyFilter = userResourceEntityPrivacyFilter(user);
		const query = {
			...filter.getQuery(),
			privacyFilter,
		};

		const { count, data } = await this.badgesQueryService.getBadges(
			query,
			filter.getMongoQueryOptions(),
		);

		return paginate<BadgeDto>(data, filter, count);
	}

	@ApiResponsePaginated(
		PrivateBadgeDto,
		200,
		'A list of the current user badges matching the filter, includes achieved and unachieved badges',
	)
	@AuthProtected()
	@Get('achievements/my-badges')
	async getUserBadges(
		@Query() filter: UserBadgesFilter,
		@UserReq() user: User,
	) {
		const { count, data } = await this.badgesQueryService.getUserBadges(
			filter,
			user,
		);

		return paginate<PrivateBadgeDto>(data, filter, count);
	}
}
