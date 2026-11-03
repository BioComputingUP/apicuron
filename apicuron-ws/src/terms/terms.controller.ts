import {
	Query,
	Controller,
	Get,
	Post,
	Param,
	Put,
	Delete,
	Body,
	UseGuards,
	Req,
	Res,
	SerializeOptions,
} from '@nestjs/common';
import {
	ApiHeader,
	ApiOkResponse,
	ApiOperation,
	ApiSecurity,
	ApiTags,
} from '@nestjs/swagger';
import { HasAResourceGuard } from '../auth/guards/belongs-to-resource.guard';
import { LocalAuthGuard } from '../auth/guards/local-auth.guard';
import { VersionHeader } from '../plugins/swagger/config';
import { CreateTermDto } from './dto/createTerm.dto';
import { DeleteTermDto } from './dto/deleteTerm.dto';
import { TermDto, TermFilterDto } from './dto/term.dto';
import { UpdateTermDto } from './dto/updateTerm.dto';
import { TermsService } from './terms.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Public } from '../auth/decorators/public.decorator';
import { AuthProtected } from '../auth/decorators/auth.decorator';
import { UserReq } from '../auth/decorators/applyUser.decorator';
import { User } from '../core/schemas/user.schema';
import { resourceEntityPrivacyFilter } from '../util/privacy.helper';
import { assertUserManagesResource } from '../util/authrization.helpers';
@ApiTags('Curation Terms')
@ApiHeader(VersionHeader)
@Controller({
	path: 'terms',
	version: '2',
})
export class TermsController {
	constructor(
		private termsService: TermsService,
		private eventEmitter: EventEmitter2,
	) {}

	private canEditResource(user, resource_id) {
		assertUserManagesResource(user, resource_id);
	}
	// swagger decorators
	@ApiOkResponse({
		description: 'a list of Terms filtered by the specified parameters',
		type: [CreateTermDto],
	})
	@ApiOperation({
		summary:
			'Get a list of Terms that describe minimal curation efforts in specific databases',
	})
	// nestjs decorators
	@AuthProtected()
	@Public()
	@Get('')
	@SerializeOptions({ type: TermDto })
	getTerms(@Query() termFilter: TermFilterDto, @UserReq() user: User | null) {
		const privacyFilter = resourceEntityPrivacyFilter(user);
		const filter = {
			...termFilter.omitPagination(),
			...privacyFilter,
		};
		return this.termsService.getResourceTerms(filter);
	}

	// swagger decorators
	@ApiOperation({
		summary:
			'Create a Term for a Specific Resource Partner, You need to own permissions for the specified Partner Resource',
	})
	@ApiOkResponse({
		description: 'Confirmation object of the created Term',
		type: CreateTermDto,
	})
	@ApiSecurity('basic')
	// nestjs decorators
	@Post('')
	@UseGuards(LocalAuthGuard, HasAResourceGuard)
	create_term(@Body() term: CreateTermDto, @Req() req) {
		this.canEditResource(req.user, term.resource_id);

		return this.termsService.createTerm(term);
	}

	@ApiOperation({
		summary:
			'Update a Term for a Specific Resource Partner, You need to own permissions for the specified Partner Resource',
	})
	@ApiOkResponse({
		description: 'Confirmation object of the edited Term',
		type: CreateTermDto,
	})
	@ApiSecurity('basic')
	// nestjs decorators
	@Put('edit')
	@UseGuards(LocalAuthGuard, HasAResourceGuard)
	async update_term(@Body() term: UpdateTermDto, @Req() req, @Res() res) {
		this.canEditResource(req.user, term.resource_id);

		const response = await this.termsService.updateTerm(term);
		res.send(response);
	}

	@ApiOperation({
		summary:
			'Delete a Term from a Specific Resource Partner, You need to own permissions for the specified Partner Resource',
	})
	@ApiOkResponse({
		description: 'A Boolean confirming the deletion of the Term',
		type: CreateTermDto,
	})
	@ApiSecurity('basic')
	@Delete(':activity_term/partner-resource/:resource_id')
	@UseGuards(LocalAuthGuard, HasAResourceGuard)
	async delete_term(
		@Param() deleteTerm: DeleteTermDto,
		@Req() req,
		@Res() res,
	) {
		const { resource_id } = deleteTerm;
		this.canEditResource(req.user, resource_id);

		const response = await this.termsService.deleteTerm(deleteTerm);

		res.send(response);
	}
}
