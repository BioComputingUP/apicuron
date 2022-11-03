import { Controller, Delete, Req, Put, ForbiddenException, Get, Param, Body, Post, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { HasAResourceGuard } from '../../auth/guards/belongs-to-resource.guard';
import { LocalAuthGuard } from '../../auth/guards/local-auth.guard';
import { VersionHeader } from '../../swagger/configuration';
import { AchievementsDefService } from '../achievements-def.service';
import { UpdateBadgeDto, DeleteBadgeDto, CreateBadgeDto, BadgeFilter } from '../dto/badge-crud.dto';
import { CreateMedalDto, DeleteMedalDto, MedalsFilter, UpdateMedalDto } from '../dto/medal-crud.dto';

@ApiTags('Achievements Definition')
@Controller({
	path: 'achievements-def',
	version: '2',
})
export class AchievementsDefController {

	constructor(protected achievementsDefService: AchievementsDefService) {}

	@Get('partner-resource/:resource_id')
	async get_resource_achievements_def(@Param('resource_id') resource_id: string) {
		const badges_promise = this.achievementsDefService.get_resource_badges(resource_id)
		const medals_promise = this.achievementsDefService.get_resource_medals(resource_id)

		const [badges, medals] = await Promise.all([badges_promise, medals_promise])
		return {
			badges,
			medals
		}
  	}

}

@ApiTags('Achievements Definition')
@Controller({
	path: 'achievements-def/badges',
	version: '2',
})
export class BadgesDefController {

	constructor(protected achievementsDefService: AchievementsDefService) {}

	private can_edit_resource(user, resource_id){
        // get the resources list that belong to the current user
        const user_resources: Array<{ resource_id: string}> = user.resources
        // check if the resource belongs to the user
        const resource_found = user_resources.find(resource => resource.resource_id == resource_id)
        // if it doesn't, we respond with  a 403 exception
        if(!resource_found){
            throw new ForbiddenException(`You either do not have the authorization to update the terms of the (${resource_id}) resource or the resource does not exist`);
        }
    }


	@Post('create')
	@UseGuards(LocalAuthGuard, HasAResourceGuard)
	async create_badge(@Body() badge: CreateBadgeDto, @Req() req){
		this.can_edit_resource(req.user, badge.resource_id);
		return await this.achievementsDefService.create_badge(badge);

	}

	@Get()
	async get_badges(@Query() badges_filter: BadgeFilter){
		return await this.achievementsDefService.get_badges(badges_filter)
	}

	@Put('edit')
	@UseGuards(LocalAuthGuard, HasAResourceGuard)
	async update_badge(@Body() update_badge: UpdateBadgeDto, @Req() req){
		this.can_edit_resource(req.user, update_badge.resource_id)
		return await this.achievementsDefService.update_badge(update_badge)
	}

	@Delete(':name/partner-resource/:resource_id')
	@UseGuards(LocalAuthGuard, HasAResourceGuard)
	async delete_badge(@Param() delete_badge: DeleteBadgeDto, @Req() req){
		this.can_edit_resource(req.user, delete_badge.resource_id);

		return await this.achievementsDefService.delete_badge(delete_badge)
	}
	

}


@ApiTags('Achievements Definition')
@ApiHeader(VersionHeader)
@Controller({
	path: 'achievements-def/medals',
	version: '2',
})
export class MedalsDefController {

	constructor(protected achievementsDefService: AchievementsDefService) {}

	private can_edit_resource(user, resource_id){
        // get the resources list that belong to the current user
        const user_resources: Array<{ resource_id: string}> = user.resources
        // check if the resource belongs to the user
        const resource_found = user_resources.find(resource => resource.resource_id == resource_id)
        // if it doesn't, we respond with  a 403 exception
        if(!resource_found){
            throw new ForbiddenException(`You either do not have the authorization to update the terms of the (${resource_id}) resource or the resource does not exist`);
        }
    }


	@Post('create')
	@UseGuards(LocalAuthGuard, HasAResourceGuard)
	async create_medal(@Body() medal: CreateMedalDto, @Req() req){
		this.can_edit_resource(req.user, medal.resource_id);
		return await this.achievementsDefService.create_medal(medal);
	}

	@Get()
	async get_medals(@Query() medals_filter: MedalsFilter){
		return await this.achievementsDefService.get_medals(medals_filter)
	}

	@Put('edit')
	@UseGuards(LocalAuthGuard, HasAResourceGuard)
	async update_medal(@Body() update_medal: UpdateMedalDto, @Req() req){
		this.can_edit_resource(req.user, update_medal.resource_id)
		return await this.achievementsDefService.update_medal(update_medal)
	}

	@Delete(':name/partner-resource/:resource_id')
	@UseGuards(LocalAuthGuard, HasAResourceGuard)
	async delete_medal(@Param() delete_medal: DeleteMedalDto, @Req() req){
		this.can_edit_resource(req.user, delete_medal.resource_id);
		return await this.achievementsDefService.delete_medal(delete_medal)
	}
	

}