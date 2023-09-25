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
	InternalServerErrorException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateResourceDto } from '../dto/createResource.dto';
import { SubmittedResourcesService } from './resources.service';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { SvgSanitationValidationPipe } from '../../shared/pipes/svg-sanitation.pipe';
import * as mime from 'mime-types'
import { ApiCreatedResponse, ApiExcludeEndpoint, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from '../../auth/guards/local-auth.guard';
import { RoleGuard } from '../../auth/guards/role.guard';
import { MakePartner } from '../dto/make-partner.dto';
import * as mv from 'mv'
import { ResourceLogoValidationPipe } from '../validators/logo-validation.pipe'


@ApiTags('Resources')
@Controller({
	version: '2',
	path: 'resources',
})
export class SubmittedResourcesController {
	constructor(
		private resourcesService: SubmittedResourcesService,
		private configService: ConfigService,
	) {
	}

	private readonly logger = new Logger(SubmittedResourcesController.name)
	private resources_folder = join(this.configService.get('PRIVATE_FILES_PATH'), 'resources');

	@ApiCreatedResponse({
		status: 201,
		description: 'Returns a confirmation value of the created resource',
		type: CreateResourceDto
	})
	@Put()
	@UseGuards(LocalAuthGuard)
	@HttpCode(201)
	@UseInterceptors(FileInterceptor('logo', {
		dest: '/tmp/apicuron/submitted_resources/',
	}))
	async create_resource(
		@Req() req,
		@Body() createResource: CreateResourceDto,
		@UploadedFile(ResourceLogoValidationPipe(true), SvgSanitationValidationPipe)
		logo: Express.Multer.File,
	) {
		const ext = mime.extension(logo.mimetype)
		const filename = `logo-${createResource.resource_id}.${ext}`;
		const file_path = join(this.resources_folder, filename)


		try {
			mv(
				logo.path,
				file_path,
				{ mkdirp: true },
				function (err) {
					if (err) {
						this.logger.error(err.message, err.stack, err.name)
						throw new InternalServerErrorException();
					}
				},
			);
		} catch (err) {
			this.logger.error(`Error moving logo file from ${logo.path} to private folder: "${file_path}"`, err.stack, err.message)
		}


		const logo_link = file_path.replace(this.configService.get('PRIVATE_FILES_PATH'), this.configService.get('PUBLIC_FILES_URL_PATH'))

		return this.resourcesService.create_resource({
			...createResource,
			logo: logo_link,
		},
			req.user.orcid_id,

		);
	}

	@ApiExcludeEndpoint(true)
	@Post('make_partner')
	@SetMetadata('roles', ['admin'])
	@UseGuards(LocalAuthGuard, RoleGuard)
	async make_resource_partner_resource(
		@Body() resource_id_obj: MakePartner
	) {
		const { resource_id } = resource_id_obj
		try {
			this.resourcesService.make_partner(resource_id)
			return "true"
		} catch (e) {
			this.logger.error(`Failed making ${resource_id} a partner-resource`, e.stack, e.message)
			return 'false'
		}
	}

}
