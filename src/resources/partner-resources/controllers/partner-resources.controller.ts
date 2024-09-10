import {
	Controller,
	Get,
	Param,
	Req,
	UploadedFile,
	Patch,
	NotFoundException,
	UseGuards,
	Body,
	Put,
	UseInterceptors,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import { SvgSanitationValidationPipe } from '../../../shared/pipes/svg-sanitation.pipe';

import { PartnerResourcesService } from '../services/partner-resources.service';
import { UpdatePartnerResourceDto } from '../../dto/updateResource.dto';
import { UsersService } from '../../../auth/users/services/users.service';
import { LocalAuthGuard } from '../../../auth/guards/local-auth.guard';
import { HasAResourceGuard } from '../../../auth/guards/belongs-to-resource.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as mime from 'mime-types';
import {
	ApiBody,
	ApiConsumes,
	ApiHeader,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiSecurity,
	ApiTags,
} from '@nestjs/swagger';
import { VersionHeader } from '../../../plugins/swagger/config';
import {
	PartnerResourceDto,
	SelectPartnerResourceDto,
} from '../../dto/partner-resources.dto';
import { AuthService } from '../../../auth/auth.service';
import * as mv from 'mv';
import { ResourceLogoValidationPipe } from '../../validators/logo-validation.pipe';

@ApiTags('Partner Resources')
@ApiHeader(VersionHeader)
@Controller({ path: 'partner-resources', version: '2' })
export class PartnerResourcesController {
	constructor(
		private partnerResourceService: PartnerResourcesService,
		private userService: UsersService,
		private configService: ConfigService,
		private authService: AuthService,
	) {}

	logger = new Logger(PartnerResourcesController.name);

	@ApiOkResponse({
		status: 200,
		description: 'Returns a list of all the partner resources of APICURON',
		type: [PartnerResourceDto],
	})
	@ApiOperation({
		summary: 'Get the list of all resources on APICURON',
	})
	@Get()
	async list_resources(): Promise<PartnerResourceDto[]> {
		return await this.partnerResourceService.get_resources();
	}

	// swagger documentation decorators
	@ApiOkResponse({
		description: 'The specified resource',
		type: PartnerResourceDto,
	})
	@ApiOperation({
		summary: 'Get information about a single resource',
	})
	@ApiNotFoundResponse({
		description: 'A 404 Not Found Response and Error Message',
	})
	@Get(':resource_id')
	async get_resource(@Param() { resource_id }: SelectPartnerResourceDto) {
		const resource = await this.partnerResourceService.get_resource(
			resource_id,
		);
		if (resource) {
			return resource;
		} else {
			throw new NotFoundException(`Resource (${resource_id}) Not Found`);
		}
	}

	// swagger documentation decorators
	@ApiConsumes('multipart/form-data')
	@ApiSecurity('basic')
	@ApiOperation({
		summary: 'Update the information about a partner resource',
	})
	@ApiBody({
		description: 'A Partner Resource Update Object',
		type: UpdatePartnerResourceDto,
	})
	@ApiOkResponse({
		description: 'Returns an update confirmation Object',
		type: PartnerResourceDto,
	})
	// nestjs logic decorators
	@Put('')
	@Patch('')
	@UseGuards(LocalAuthGuard, HasAResourceGuard)
	@UseInterceptors(
		FileInterceptor('logo', {
			dest: '/tmp/apicuron/resources',
		}),
	)
	async update_resource_values(
		@Body() update_resource: UpdatePartnerResourceDto,
		@Req() request,
		@UploadedFile(ResourceLogoValidationPipe(), SvgSanitationValidationPipe)
		logo: Express.Multer.File,
	) {
		const { resource_id } = update_resource;

		// check if the user has a permission to edit the PartnerResource
		this.authService.user_has_resource(request.user, resource_id);

		// if there's an uploaded file
		if (logo) {
			const ext = mime.extension(logo.mimetype);
			const public_path = join(
				this.configService.get('PUBLIC_FILES_PATH'),
				'resources',
				`${logo.filename}.${ext}`,
			);

			mv(logo.path, public_path, { mkdirp: true }, (err: Error) => {
				if (err) {
					this.logger.error(err.message, err.stack, err.name);
					throw new InternalServerErrorException();
				}
			});

			const logo_link = public_path.replace(
				this.configService.get('PUBLIC_FILES_PATH'),
				this.configService.get('PUBLIC_FILES_URL_PATH'),
			);

			await this.partnerResourceService.update_resource({
				...update_resource,
				logo: logo_link,
			});
		} else {
			await this.partnerResourceService.update_resource(update_resource);
		}

		return await this.partnerResourceService.get_resource(resource_id);
	}
}
