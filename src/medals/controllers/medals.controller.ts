import { Controller, Get, Query } from '@nestjs/common';
import { UserReq } from '../../auth/decorators/applyUser.decorator';
import { AuthProtected } from '../../auth/decorators/auth.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { paginate } from '../../pagination/paginator';
import { userResourceEntityPrivacyFilter } from '../../util/privacy.helper';
import { User } from '../../core/schemas/user.schema';
import { MedalsQueryService } from '../services/medals-query.service';
import { VersionHeader } from '../../plugins/swagger/config';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { MedalFilter } from '../dto/medal-filter.dto';

@ApiHeader(VersionHeader)
@ApiTags('Achievements')
@Controller({
	version: '2',
})
export class MedalsController {
	constructor(protected medalsQueryService: MedalsQueryService) {}

	@AuthProtected()
	@Public()
	@Get('achievements/medals')
	async get_medals(@Query() filter: MedalFilter, @UserReq() user: User | null) {
		const privacyFilter = userResourceEntityPrivacyFilter(user);
		const query = {
			...filter.getQuery(),
			...privacyFilter,
		};
		const { data, count } = await this.medalsQueryService.getMedals(
			query,
			filter.getMongoQueryOptions(),
		);

		return paginate(data, filter, count);
	}
}
