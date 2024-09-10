import { Controller, Get, Param } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { VersionHeader } from '../../plugins/swagger/config';
import { AchievementsService } from '../achievements.service';
import {
	AchievementSelectDto,
	UserAchievements,
} from '../dto/achievements.dto';
import { Public } from '../../auth/decorators/public.decorator';
import { AuthProtected } from '../../auth/decorators/auth.decorator';
import { UserReq } from '../../auth/decorators/applyUser.decorator';
import { userResourceEntityPrivacyFilter } from '../../util/privacy.helper';
import { User } from '../../core/schemas/user.schema';
import { ApiResponseWrapped } from '../../shared/decorators/wrapped-data-response.decorator';

@ApiTags('Achievements')
@ApiHeader(VersionHeader)
@Controller({
	path: 'achievements',
	version: '2',
})
export class AchievementsController {
	constructor(protected achievementsService: AchievementsService) {}

	@ApiResponseWrapped(
		UserAchievements,
		200,
		'A list of achievements achieved by a user in a resource',
	)
	@AuthProtected()
	@Public()
	@Get(':orcid_id/:resource_id')
	async get_user_achievements(
		@Param() params: AchievementSelectDto,
		@UserReq() user: User | null,
	) {
		const privacyFilter = userResourceEntityPrivacyFilter(user);
		const { resource_id, orcid_id } = params;
		const userAchievements = this.achievementsService.user_achievements({
			curator_orcid: orcid_id,
			resource_id,
			...privacyFilter,
		});

		return { data: userAchievements };
	}
}
