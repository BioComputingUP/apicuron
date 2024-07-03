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
import { CreateMedalDefDto } from '../dto/create-medal-def.dto';
import { DeleteMedalDefDto } from '../dto/delete-medal-def.dto';
import { resourceEntityPrivacyFilter } from '../../util/privacy.helper';
import { AuthProtected } from '../../auth/decorators/auth.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { User } from '../../core/schemas/user.schema';
import { UserReq } from '../../auth/decorators/applyUser.decorator';
import { VersionHeader } from '../../swagger/config';
import { AuthService } from '../../auth/auth.service';
import { paginate } from '../../pagination/paginator';
import { UpdateMedalDefDto } from '../dto/update-medal-def.dto';
import { MedalDefCommandsService } from '../services/medal-def-commands.service';
import { MedalDefQueriesService } from '../services/medal-def-queries.service';
import { MedalDefFilter } from '../dto/filter-medal-def.dto';
import { Response } from 'express';

@ApiTags('Achievements Definition')
@ApiHeader(VersionHeader)
@Controller({
	path: 'achievements-def/medals',
	version: '2',
})
export class MedalsDefController {
	constructor(
		protected queriesService: MedalDefQueriesService,
		protected commandsService: MedalDefCommandsService,
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
		type: CreateMedalDefDto,
	})
	@ApiSecurity('basic')
	@Post()
	@AuthProtected()
	async create_medal(
		@Body() createMedal: CreateMedalDefDto,
		@Req() req,
		@Res() res: Response,
	) {
		this.can_edit_resource(req.user, createMedal.resource_id);
		const response = await this.commandsService.createMedalDef(createMedal);

		res.send({ data: response });
	}

	@ApiOperation({
		summary: 'Get a list of medals based on a passed filter',
	})
	@ApiOkResponse({
		description: 'A list of medals that correspond to the filter',
		type: [CreateMedalDefDto],
	})
	@ApiSecurity('basic')
	@AuthProtected()
	@Public()
	@Get()
	async getMedals(
		@Query() medalFilter: MedalDefFilter,
		@UserReq() user: User | null,
	) {
		const privacyQuery = resourceEntityPrivacyFilter(user);

		const queryFilter = {
			...medalFilter.omitPagination(),
			...privacyQuery,
		};
		const options = medalFilter.getMongoQueryOptions();

		const { data, count } = await this.queriesService.getMedalDefs(
			queryFilter,
			options,
		);
		return paginate(data, medalFilter, count);
	}

	@ApiOperation({
		summary: 'Update Medal definition for a specified resource',
	})
	@ApiOkResponse({
		description: 'Confirmation of the Updated Medal',
		type: CreateMedalDefDto,
	})
	@ApiSecurity('basic')
	@Put('edit')
	@AuthProtected()
	async update_medal(
		@Body() update_medal: UpdateMedalDefDto,
		@Req() req,
		@Res() res: Response,
	) {
		this.can_edit_resource(req.user, update_medal.resource_id);
		const response = await this.commandsService.updateMedalDef(update_medal);

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
	@AuthProtected()
	async delete_medal(@Param() delete_medal: DeleteMedalDefDto, @Req() req) {
		this.can_edit_resource(req.user, delete_medal.resource_id);
		return await this.commandsService.deleteMedalDef(delete_medal);
	}
}
