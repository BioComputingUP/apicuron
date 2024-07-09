import { Controller, Get, Param } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { VersionHeader } from '../../plugins/swagger/config';
import { AchievementsService } from '../achievements.service';
import { AchievementSelectDto } from '../dto/achievements.dto';
import { Public } from '../../auth/decorators/public.decorator';
import { AuthProtected } from '../../auth/decorators/auth.decorator';
import { UserReq } from '../../auth/decorators/applyUser.decorator';
import { userResourceEntityPrivacyFilter } from '../../util/privacy.helper';
import { User } from '../../core/schemas/user.schema';

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
}
