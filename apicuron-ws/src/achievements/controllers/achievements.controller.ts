import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { AuthorizationHeader, VersionHeader } from '../../swagger/config';
import { PartnerResourcesService } from '../../resources/partner-resources/partner-resources.service';
import { AchievementsService } from '../achievements.service';
import { AchievementSelectDto } from '../dto/achievements.dto';
import { AchievementFilter } from '../dto/achievement-filter.dto';

@ApiTags('Achievements')
@ApiHeader(VersionHeader)
@Controller({
    path:'achievements',
    version: '2'
})
export class AchievementsController {

    constructor(protected achievementsService: AchievementsService) {}

    @Get(':orcid_id/:resource_id')
	async get_user_achievements(@Param() params: AchievementSelectDto){
        const { resource_id, orcid_id } = params
		return this.achievementsService.user_achievements(orcid_id, resource_id)
	}


    @Get('medals')
	async get_medals(@Query() filter: AchievementFilter){

		return await this.achievementsService.getMedals(filter)
	}

    @Get('badges')
	async get_badges(@Query() filter: AchievementFilter){
		return await this.achievementsService.getBadges(filter)
	}
}
