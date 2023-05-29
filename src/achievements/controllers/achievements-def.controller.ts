import { Controller, Delete, Req, Put, ForbiddenException, Get, Param, Body, Post, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../../auth/auth.service';
import { HasAResourceGuard } from '../../auth/guards/belongs-to-resource.guard';
import { LocalAuthGuard } from '../../auth/guards/local-auth.guard';
import { AuthorizationHeader, VersionHeader } from '../../config/swagger';
import { AchievementsDefService } from '../achievements-def.service';
import { ResourceAchievmentsDef } from '../dto/achievement-def.dto';
import { UpdateBadgeDto, DeleteBadgeDto, CreateBadgeDto, BadgeFilter } from '../dto/badge-crud.dto';
import { CreateMedalDto, DeleteMedalDto, MedalsFilter, UpdateMedalDto } from '../dto/medal-crud.dto';

@ApiTags('Define Achievements')
@ApiHeader(VersionHeader)
@Controller({
	path: 'achievements-def',
	version: '2',
})
export class AchievementsDefController {

	constructor(protected achievementsDefService: AchievementsDefService) {}

	@ApiOperation({
        summary: 'Get The list of Badge and Medal definitions for a specific Resource'
    })
    @ApiOkResponse({
        description: 'an object that contains an array of badge definitions and an array of medal definitions',
        type: ResourceAchievmentsDef
    })
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
@ApiHeader(VersionHeader)
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

	@ApiOperation({
        summary: 'Create badge definition for a specified resource'
    })
    @ApiOkResponse({
        description: 'Confirmation of the created Badge',
        type: CreateBadgeDto
    })
	@ApiHeader(AuthorizationHeader)
	// nest decorators
	@Post('create')
	@UseGuards(LocalAuthGuard, HasAResourceGuard)
	async create_badge(@Body() badge: CreateBadgeDto, @Req() req){
		this.can_edit_resource(req.user, badge.resource_id);
		return await this.achievementsDefService.create_badge(badge);

	}

	@ApiOperation({
        summary: 'Get a list of badges based on a passed filter'
    })
    @ApiOkResponse({
        description: 'A list of badges that correspond to the filter',
        type: Array<CreateBadgeDto>
    })
	@Get()
	async get_badges(@Query() badges_filter: BadgeFilter){
		return await this.achievementsDefService.get_badges(badges_filter)
	}

	@ApiOperation({
        summary: 'Update badge definition for a specified resource'
    })
    @ApiOkResponse({
        description: 'Confirmation of the updated Badge',
        type: CreateBadgeDto
    })
	@ApiHeader(AuthorizationHeader)
	@Put('edit')
	@UseGuards(LocalAuthGuard, HasAResourceGuard)
	async update_badge(@Body() update_badge: UpdateBadgeDto, @Req() req){
		this.can_edit_resource(req.user, update_badge.resource_id)
		return await this.achievementsDefService.update_badge(update_badge)
	}

	@ApiOperation({
        summary: 'Delete a badge definition for a specified resource'
    })
    @ApiOkResponse({
        description: 'A boolean confirmation of the successfull deletion',
        type: Boolean
    })
	@ApiHeader(AuthorizationHeader)
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

	constructor(protected achievementsDefService: AchievementsDefService, protected authService: AuthService) {}

	private can_edit_resource(user, resource_id){
		return this.authService.user_has_resource(user, resource_id);
    }
	
	@ApiOperation({
        summary: 'Create Medal definition for a specified resource'
    })
    @ApiOkResponse({
        description: 'Confirmation of the Created Medal',
        type: CreateMedalDto
    })
	@ApiHeader(AuthorizationHeader)
	@Post('create')
	@UseGuards(LocalAuthGuard, HasAResourceGuard)
	async create_medal(@Body() medal: CreateMedalDto, @Req() req){
		this.can_edit_resource(req.user, medal.resource_id);
		return await this.achievementsDefService.create_medal(medal);
	}

	@ApiOperation({
        summary: 'Get a list of medals based on a passed filter'
    })
    @ApiOkResponse({
        description: 'A list of medals that correspond to the filter',
        type: Array<CreateMedalDto>
    })
	@ApiHeader(AuthorizationHeader)
	@Get()
	async get_medals(@Query() medals_filter: MedalsFilter){
		return await this.achievementsDefService.get_medals(medals_filter)
	}


	@ApiOperation({
        summary: 'Update Medal definition for a specified resource'
    })
    @ApiOkResponse({
        description: 'Confirmation of the Updated Medal',
        type: CreateMedalDto
    })
	@ApiHeader(AuthorizationHeader)
	@Put('edit')
	@UseGuards(LocalAuthGuard, HasAResourceGuard)
	async update_medal(@Body() update_medal: UpdateMedalDto, @Req() req){
		this.can_edit_resource(req.user, update_medal.resource_id)
		return await this.achievementsDefService.update_medal(update_medal)
	}


	@ApiOperation({
        summary: 'Delete Medal definition for a specified resource'
    })
    @ApiOkResponse({
        description: 'Boolean Confirmation of the Deleted Medal',
        type: Boolean
    })
	@ApiHeader(AuthorizationHeader)
	@Delete(':name/partner-resource/:resource_id')
	@UseGuards(LocalAuthGuard, HasAResourceGuard)
	async delete_medal(@Param() delete_medal: DeleteMedalDto, @Req() req){
		this.can_edit_resource(req.user, delete_medal.resource_id);
		return await this.achievementsDefService.delete_medal(delete_medal)
	}
	

}