import {
	Controller,
	Delete,
	Req,
	Put,
	Get,
	Param,
	Body,
	Post,
	Query,
	UseGuards,
	Res,
} from '@nestjs/common';
import {
	ApiHeader,
	ApiOperation,
	ApiOkResponse,
	ApiTags,
	ApiSecurity,
} from '@nestjs/swagger';
import { AuthService } from '../../auth/auth.service';
import { HasAResourceGuard } from '../../auth/guards/belongs-to-resource.guard';
import { LocalAuthGuard } from '../../auth/guards/local-auth.guard';
import { paginate } from '../../pagination/paginator';
import { VersionHeader } from '../../swagger/config';
import { AchievementsDefService } from '../achievements-def.service';
import { ResourceAchievmentsDef } from '../dto/achievement-def.dto';
import {
	UpdateBadgeDefDto as UpdateBadgeDefDto,
	DeleteBadgeDefDto,
	CreateBadgeDefDto,
	BadgeDefFilter,
} from '../dto/badge-crud.dto';
import {
	CreateMedalDto,
	DeleteMedalDefDto,
	MedalsFilter,
	UpdateMedalDefDto,
} from '../dto/medal-crud.dto';
import { Response } from 'express';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuthProtected } from '../../auth/decorators/auth.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { UserReq } from '../../auth/decorators/applyUser.decorator';
import { User } from '../../core/schemas/user.schema';
import { getPrivacyQueryFromUser } from '../../util/user.privacy';

@ApiTags('Define Achievements')
@ApiHeader(VersionHeader)
@Controller({
	path: 'achievements-def',
	version: '2',
})
export class AchievementsDefController {
	constructor(protected achievementsDefService: AchievementsDefService) {}

	@ApiOperation({
		summary:
			'Get The list of Badge and Medal definitions for a specific Resource',
	})
	@ApiOkResponse({
		description:
			'an object that contains an array of badge definitions and an array of medal definitions',
		type: ResourceAchievmentsDef,
	})
	@Get('partner-resource/:resource_id')
	async get_resource_achievements_def(
		@Param('resource_id') resource_id: string,
	) {
		const badges_promise =
			this.achievementsDefService.getResourceBadgeDefs(resource_id);
		const medals_promise =
			this.achievementsDefService.getResourceMedalDefs(resource_id);

		const [badges, medals] = await Promise.all([
			badges_promise,
			medals_promise,
		]);
		return {
			badges,
			medals,
		};
	}
}

@ApiTags('Achievements Definition')
@ApiHeader(VersionHeader)
@Controller({
	path: 'achievements-def/badges',
	version: '2',
})
export class BadgesDefController {
	constructor(
		protected achievementsDefService: AchievementsDefService,
		protected authService: AuthService,
		protected eventEmitter: EventEmitter2,
	) {}

	private can_edit_resource(user, resource_id) {
		return this.authService.user_has_resource(user, resource_id);
	}

	@ApiOperation({
		summary: 'Create badge definition for a specified resource',
	})
	@ApiOkResponse({
		description: 'Confirmation of the created Badge',
		type: CreateBadgeDefDto,
	})
	@ApiSecurity('basic')
	// nest decorators
	@Post()
	@UseGuards(LocalAuthGuard, HasAResourceGuard)
	async create_badge(@Body() badge: CreateBadgeDefDto, @Req() req) {
		this.can_edit_resource(req.user, badge.resource_id);
		return await this.achievementsDefService.createBadgeDef(badge);
	}

	@ApiOperation({
		summary: 'Get a list of badges based on a passed filter',
	})
	@ApiOkResponse({
		description: 'A list of badges that correspond to the filter',
		type: [CreateBadgeDefDto],
	})
	@AuthProtected()
	@Public()
	@Get()
	async get_badges(
		@Query() badges_filter: BadgeDefFilter,
		@UserReq() user: User | null,
	) {
		const privacyQuery = user ? getPrivacyQueryFromUser(user) : {};
		const { data, count } = await this.achievementsDefService.getbadgeDefs(
			badges_filter,
			privacyQuery,
		);

		return paginate(data, badges_filter, count);
	}

	@ApiOperation({
		summary: 'Update badge definition for a specified resource',
	})
	@ApiOkResponse({
		description: 'Confirmation of the updated Badge',
		type: CreateBadgeDefDto,
	})
	@ApiSecurity('basic')
	@Put('edit')
	@UseGuards(LocalAuthGuard, HasAResourceGuard)
	async update_badge(
		@Body() update_badge: UpdateBadgeDefDto,
		@Req() req,
		@Res() res,
	) {
		this.can_edit_resource(req.user, update_badge.resource_id);
		const response = await this.achievementsDefService.updateBadgeDef(
			update_badge,
		);

		res.send({ data: response });
	}

	@ApiOperation({
		summary: 'Delete a badge definition for a specified resource',
	})
	@ApiOkResponse({
		description: 'A boolean confirmation of the successfull deletion',
		type: Boolean,
	})
	@ApiSecurity('basic')
	@Delete(':name/partner-resource/:resource_id')
	@UseGuards(LocalAuthGuard, HasAResourceGuard)
	async delete_badge(
		@Param() delete_badge: DeleteBadgeDefDto,
		@Req() req,
		@Res() res,
	) {
		this.can_edit_resource(req.user, delete_badge.resource_id);

		const response = await this.achievementsDefService.deleteBadgeDef(
			delete_badge,
		);

		res.send({ data: response });
	}
}

@ApiTags('Achievements Definition')
@ApiHeader(VersionHeader)
@Controller({
	path: 'achievements-def/medals',
	version: '2',
})
export class MedalsDefController {
	constructor(
		protected achievementsDefService: AchievementsDefService,
		protected authService: AuthService,
		protected eventEmitter: EventEmitter2,
	) {}

	private can_edit_resource(user, resource_id) {
		return this.authService.user_has_resource(user, resource_id);
	}

	@ApiOperation({
		summary: 'Create Medal definition for a specified resource',
	})
	@ApiOkResponse({
		description: 'Confirmation of the Created Medal',
		type: CreateMedalDto,
	})
	@ApiSecurity('basic')
	@Post()
	@UseGuards(LocalAuthGuard, HasAResourceGuard)
	async create_medal(
		@Body() medal: CreateMedalDto,
		@Req() req,
		@Res() res: Response,
	) {
		this.can_edit_resource(req.user, medal.resource_id);
		const response = await this.achievementsDefService.createMedalDef(medal);

		res.send({ data: response });
	}

	@ApiOperation({
		summary: 'Get a list of medals based on a passed filter',
	})
	@ApiOkResponse({
		description: 'A list of medals that correspond to the filter',
		type: [CreateMedalDto],
	})
	@ApiSecurity('basic')
	@AuthProtected()
	@Public()
	@Get()
	async get_medals(
		@Query() medals_filter: MedalsFilter,
		@UserReq() user: User | null,
	) {
		const privacyQuery = user ? getPrivacyQueryFromUser(user) : {};
		const { data, count } = await this.achievementsDefService.getMedalDefs(
			medals_filter,
			privacyQuery,
		);
		return paginate(data, medals_filter, count);
	}

	@ApiOperation({
		summary: 'Update Medal definition for a specified resource',
	})
	@ApiOkResponse({
		description: 'Confirmation of the Updated Medal',
		type: CreateMedalDto,
	})
	@ApiSecurity('basic')
	@Put('edit')
	@UseGuards(LocalAuthGuard, HasAResourceGuard)
	async update_medal(
		@Body() update_medal: UpdateMedalDefDto,
		@Req() req,
		@Res() res: Response,
	) {
		this.can_edit_resource(req.user, update_medal.resource_id);
		const response = await this.achievementsDefService.updateMedalDef(
			update_medal,
		);

		res.send({ data: response });
	}

	@ApiOperation({
		summary: 'Delete Medal definition for a specified resource',
	})
	@ApiOkResponse({
		description: 'Boolean Confirmation of the Deleted Medal',
		type: Boolean,
	})
	@ApiSecurity('basic')
	@Delete(':name/partner-resource/:resource_id')
	@UseGuards(LocalAuthGuard, HasAResourceGuard)
	async delete_medal(@Param() delete_medal: DeleteMedalDefDto, @Req() req) {
		this.can_edit_resource(req.user, delete_medal.resource_id);
		return await this.achievementsDefService.deleteMedalDef(delete_medal);
	}
}
