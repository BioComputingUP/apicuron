import {
	Body,
	Controller,
	Post,
	HttpCode,
	Put,
	UploadedFile,
	UseInterceptors,
	Logger,
	UseGuards,
	SetMetadata,
	Req,
	InternalServerErrorException,
	Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateResourceDto } from '../dto/createResource.dto';
import { SubmittedResourcesService } from './resources.service';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { SvgSanitationValidationPipe } from '../../shared/pipes/svg-sanitation.pipe';
import * as mime from 'mime-types';
import {
	ApiCreatedResponse,
	ApiExcludeEndpoint,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { LocalAuthGuard } from '../../auth/guards/local-auth.guard';
import { RoleGuard } from '../../auth/guards/role.guard';
import { MakePartner } from '../dto/make-partner.dto';
import * as mv from 'mv';
import { ResourceLogoValidationPipe } from '../validators/logo-validation.pipe';
import { FileUploadDto } from '../../util/file-upload.helper';
import { AuthProtected } from '../../auth/decorators/auth.decorator';
import { UserReq } from '../../auth/decorators/applyUser.decorator';
import { User } from '../../core/schemas';

@ApiTags('Resources')
@Controller({
	version: '2',
	path: 'resources',
})
export class SubmittedResourcesController {
	constructor(
		private resourcesService: SubmittedResourcesService,
		private configService: ConfigService,
	) {}

	private readonly logger = new Logger(SubmittedResourcesController.name);
	private resources_folder = join(
		this.configService.get('PRIVATE_FILES_PATH'),
		'resources',
	);

	@ApiCreatedResponse({
		status: 201,
		description: 'Returns a confirmation value of the created resource',
		type: CreateResourceDto,
	})
	@Put()
	@AuthProtected()
	@HttpCode(201)
	@UseInterceptors(FileInterceptor('logo'))
	async create_resource(
		@UserReq() user: User,
		@Body() createResource: CreateResourceDto,
		@UploadedFile(ResourceLogoValidationPipe(true), SvgSanitationValidationPipe)
		logo: Express.Multer.File,
	) {
		const logoFile = FileUploadDto.fromMulter(logo);
		logoFile.buffer = logo.buffer;

		const data = await this.resourcesService.create_resource(
			createResource,
			user.orcid_id,
			logoFile,
		);
		return `Resource created`;
	}

	@ApiExcludeEndpoint(true)
	@Post('make_partner')
	@SetMetadata('roles', ['admin'])
	@UseGuards(LocalAuthGuard, RoleGuard)
	async make_resource_partner_resource(@Body() resource_id_obj: MakePartner) {
		const { resource_id } = resource_id_obj;
		try {
			this.resourcesService.make_partner(resource_id);
			return 'true';
		} catch (e) {
			this.logger.error(
				`Failed making ${resource_id} a partner-resource`,
				e.stack,
				e.message,
			);
			return 'false';
		}
	}

	@ApiExcludeEndpoint(true)
	@Get()
	@SetMetadata('roles', ['admin'])
	@UseGuards(LocalAuthGuard, RoleGuard)
	async getSubmittedResources() {
		return await this.resourcesService.list_submitted_resources();
	}
}
