import {
	Controller,
	Post,
	Body,
	Req,
	Get,
	Put,
	Res,
	Delete,
	Param,
	Query,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
	ApiTags,
	ApiHeader,
	ApiOperation,
	ApiOkResponse,
	ApiSecurity,
} from '@nestjs/swagger';
import { CreateBadgeDefDto } from '../dto/create-badge-def.dto';
import { DeleteBadgeDefDto } from '../dto/delete-badge-def.dto';
import { resourceEntityPrivacyFilter } from '../../util/privacy.helper';
import { AuthProtected } from '../../auth/decorators/auth.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { User } from '../../core/schemas/user.schema';
import { UserReq } from '../../auth/decorators/applyUser.decorator';
import { VersionHeader } from '../../swagger/config';
import { AuthService } from '../../auth/auth.service';
import { paginate } from '../../pagination/paginator';
import { UpdateBadgeDefDto } from '../dto/update-badge-def.dto';
import { BadgeDefCommandsService } from '../services/badge-def-commands.service';
import { BadgeDefQueriesService } from '../services/badge-def-queries.service';
import { BadgeDefFilter } from '../dto/filter-badge-def.dto';

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
	@AuthProtected()
	async create_badge(@Body() badge: CreateBadgeDefDto, @Req() req) {
		this.can_edit_resource(req.user, badge.resource_id);
		return await this.badgeDefCommands.createBadgeDef(badge);
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
	async getBadgeDefs(
		@Query() badges_filter: BadgeDefFilter,
		@UserReq() user: User | null,
	) {
		const privacyQuery = user ? resourceEntityPrivacyFilter(user) : {};
		const { data, count } = await this.badgeDefQueries.getbadgeDefs(
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
	@AuthProtected()
	async updateBadgeDef(
		@Body() update_badge: UpdateBadgeDefDto,
		@Req() req,
		@Res() res,
	) {
		this.can_edit_resource(req.user, update_badge.resource_id);
		const response = await this.badgeDefCommands.updateBadgeDef(update_badge);

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
	@AuthProtected()
	async deleteBadgeDef(
		@Param() delete_badge: DeleteBadgeDefDto,
		@Req() req,
		@Res() res,
	) {
		this.can_edit_resource(req.user, delete_badge.resource_id);

		const response = await this.badgeDefCommands.deleteBadgeDef(delete_badge);

		res.send({ data: response });
	}
}
