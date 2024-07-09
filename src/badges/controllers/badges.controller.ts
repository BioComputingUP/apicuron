import { Controller, Get, Query } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { UserReq } from '../../auth/decorators/applyUser.decorator';
import { AuthProtected } from '../../auth/decorators/auth.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { paginate } from '../../pagination/paginator';
import { VersionHeader } from '../../plugins/swagger/config';
import { userResourceEntityPrivacyFilter } from '../../util/privacy.helper';
import { User } from '../../core/schemas/user.schema';
import { BadgesQueryService } from '../services/badges-query.service';
import { BadgeFilter } from '../dto/badge-filter.dto';

@ApiTags('Achievements')
@ApiHeader(VersionHeader)
@Controller({
	version: '2',
})
export class BadgesController {
	constructor(protected badgesQueryService: BadgesQueryService) {}

	@AuthProtected()
	@Public()
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

		return paginate(data, filter, count);
	}
}
