import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	Query,
	Req,
	SerializeOptions
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
	ApiHeader,
	ApiOkResponse,
	ApiOperation,
	ApiSecurity,
	ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { AuthService } from '../../auth/auth.service';
import { UserReq } from '../../auth/decorators/applyUser.decorator';
import { AuthProtected } from '../../auth/decorators/auth.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { User } from '../../core/schemas/user.schema';
import { paginate, Paginated } from '../../pagination/paginator';
import { VersionHeader } from '../../plugins/swagger/config';
import { resourceEntityPrivacyFilter } from '../../util/privacy.helper';
import { AssignBadgeDto } from '../dto/assign-badge.dto';
import { AssignableBadgeDto, BadgeDefDto } from '../dto/badge.dto';
import { CreateBadgeDefDto } from '../dto/create-badge-def.dto';
import { DeleteBadgeDefDto } from '../dto/delete-badge-def.dto';
import { BadgeDefFilter } from '../dto/filter-badge-def.dto';
import { UpdateBadgeDefDto } from '../dto/update-badge-def.dto';
import { AssignableBadgesService } from '../services/assignable-badges.service';
import { BadgeDefCommandsService } from '../services/badge-def-commands.service';
import { BadgeDefQueriesService } from '../services/badge-def-queries.service';

@ApiTags('Achievements Definition')
@ApiHeader(VersionHeader)
@Controller({
	path: 'achievements-def/badges',
	version: '2',
})
export class BadgesDefController {
	constructor(
		protected badgeDefCommands: BadgeDefCommandsService,
		protected badgeDefQueries: BadgeDefQueriesService,
		protected assignableBadgesService: AssignableBadgesService,
		protected authService: AuthService,
		protected eventEmitter: EventEmitter2,
	) {}

	private can_edit_resource(user: User, resource_id: string) {
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
	@AuthProtected()
	@SerializeOptions({ type: BadgeDefDto })
	async create_badge(@Body() badge: CreateBadgeDefDto, @Req() req) {
		this.can_edit_resource(req.user, badge.resource_id);
		const res =  await this.badgeDefCommands.createBadgeDef(badge);
		return res;
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
	// eslint-disable-next-line prettier/prettier
	@SerializeOptions({ type: Paginated<BadgeDefDto> })
	@Get()
	async getBadgeDefs(
		@Query() badges_filter: BadgeDefFilter,
		@UserReq() user: User | null,
	) {
		const privacyQuery = user ? resourceEntityPrivacyFilter(user) : {};
		const { data, count } = await this.badgeDefQueries.getbadgeDefs(
			badges_filter,
			privacyQuery,
		);


		return paginate<BadgeDefDto>(BadgeDefDto, data, badges_filter, count);
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
	@AuthProtected()
	@SerializeOptions({ type: BadgeDefDto })
	async updateBadgeDef(@Body() update_badge: UpdateBadgeDefDto, @Req() req) {
		this.can_edit_resource(req.user, update_badge.resource_id);
		const updatedBadge = await this.badgeDefCommands.updateBadgeDef(
			update_badge,
		);

		return updatedBadge;
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
	@AuthProtected()
	async deleteBadgeDef(@Param() deleteBadgeDef: DeleteBadgeDefDto, @Req() req) {
		this.can_edit_resource(req.user, deleteBadgeDef.resource_id);

		const deletedBadgeDef = await this.badgeDefCommands.deleteBadgeDef(
			deleteBadgeDef,
		);

		const badgeDefEntity = plainToInstance(BadgeDefDto, deletedBadgeDef, {
			enableCircularCheck: true,
			excludeExtraneousValues: true,
		});

		return badgeDefEntity;
	}

	@Post('assign-badge')
	@SerializeOptions({ type: AssignableBadgeDto })
	assignBadgetoUsers(
		@Body() assignBadge: AssignBadgeDto,
		@Req() req
	) {

		// this.can_edit_resource(req.user, assignBadge.resource_id)
		return this.assignableBadgesService.assign_badge_to_users(assignBadge)

	}

	@Delete('withdraw-badge')
	@SerializeOptions({ type: AssignableBadgeDto })
	unassignBadgeFromUsers(
		@Body() assignBadge: AssignBadgeDto,
		@Req() req
	) {
		// this.can_edit_resource(req.user, assignBadge.resource_id)
		return this.assignableBadgesService.withdraw_badge_from_user(assignBadge)
	}
}
