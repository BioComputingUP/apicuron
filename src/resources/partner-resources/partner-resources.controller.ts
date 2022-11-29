import {
	Controller,
	Get,
	Param,
	HttpCode,
	Req,
	UploadedFile,
	Patch,
	NotFoundException,
	ParseFilePipe,
	UseGuards,
	Body,
	Put,
	UnauthorizedException,
	MaxFileSizeValidator,
	FileTypeValidator,
	UseInterceptors,
	InternalServerErrorException,
	Logger
} from '@nestjs/common';
import { SvgSanitationValidationPipe } from '../../shared/pipes/svg-sanitation.pipe';

import { PartnerResourcesService } from './partner-resources.service';
import { UpdatePartnerResourceDto } from '../dto/updateResource.dto';
import { UsersService } from '../../auth/users/users.service';
import { LocalAuthGuard } from '../../auth/guards/local-auth.guard';
import { HasAResourceGuard } from '../../auth/guards/belongs-to-resource.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { rename } from 'fs';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as mime from 'mime-types';
import { ApiBody, ApiConsumes, ApiCreatedResponse, ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthorizationHeader, VersionHeader } from '../../config/swagger';
import { PartnerResourceDto, SelectPartnerResourceDto } from '../dto/partner-resources.dto';

const resource_image_validation_pipe = new ParseFilePipe({
	validators: [
		new MaxFileSizeValidator({ maxSize: 1000000 }),
		new FileTypeValidator({
			fileType: /(^image)(\/)(jpeg|png|svg\+xml|webp)*/gm,
		}),
	],
	fileIsRequired: false,
});


@ApiTags('Partner Resources')
@ApiHeader(VersionHeader)
@Controller({ path: 'partner-resources', version: '2' })
export class PartnerResourcesController {
	constructor(
		private partnerResourceService: PartnerResourcesService,
		private userService: UsersService,
		private configService: ConfigService,
	) {}

	logger = new Logger(PartnerResourcesController.name)

	@ApiOkResponse({
		status: 200,
		description: 'Returns a list of all the partner resources of APICURON',
		type: Array<PartnerResourceDto>
	})
	@Get()
	async list_resources(): Promise<Array<PartnerResourceDto>> {
		return await this.partnerResourceService.get_resources();
	}

	// swagger documentation decorators
	@ApiOkResponse({
		description: 'The specified resource',
		type: PartnerResourceDto
	})
	@ApiNotFoundResponse({
		description: 'A 404 Not Found Response and Error Message'
	})
	@Get(':resource_id')
	async get_resource(@Param() resourceSelector: SelectPartnerResourceDto){
		const { resource_id } = resourceSelector
		const resource = await this.partnerResourceService.get_resource(resource_id);
		if(resource){
			return resource
		}else{
			throw new NotFoundException(`Resource (${resource_id}) Not Found`)
		}
	}

	
	// swagger documentation decorators
	@ApiConsumes('multipart/form-data')
	@ApiHeader(AuthorizationHeader)
	@ApiBody({
		description: 'A Partner Resource Update Object',
		type: UpdatePartnerResourceDto
	})
	@ApiOkResponse({
		description: 'Returns an update confirmation Object',
		type: PartnerResourceDto
	})
	// nestjs logic decorators
	@Put('edit')
	@Patch('edit')
	@UseGuards(LocalAuthGuard, HasAResourceGuard)
	@UseInterceptors(
		FileInterceptor('logo', {
			dest: '/tmp/apicuron/resources',
		}),
	)
	async update_resource_values(
		@Body() update_resource: UpdatePartnerResourceDto,
		@Req() request,
		@UploadedFile(resource_image_validation_pipe, SvgSanitationValidationPipe)
		logo: Express.Multer.File,
	) {
		// check if the user has a permission to edit the PartnerResource
		const user = await this.userService.get_by_orcid(request.user.orcid_id);

		const user_resource = user.resources.find(
			(resource) => resource.resource_id == update_resource.resource_id,
		);
		if (!user_resource) {
			throw new UnauthorizedException('Cannot update this resource');
		}

		const { resource_id } = update_resource;

		// if there's an uploaded file
		if (logo) {
			var mv = require('mv');
			const ext = mime.extension(logo.mimetype);
			const public_path = join(
					this.configService.get('PUBLIC_FILES_PATH'),
					'resources',
					`${logo.filename}.${ext}`,
				);
			mv(
				logo.path,
				public_path,
				{ mkdirp: true },
				function (err) {
					if(err){
						console.error(PartnerResourcesController.name, err)
						throw new InternalServerErrorException();	
					}
				},
			);

			await this.partnerResourceService.update_resource({...update_resource, logo: `${logo.filename}.${ext}` });
		}else{
			await this.partnerResourceService.update_resource(update_resource);
		}


		return await this.partnerResourceService.get_resource(resource_id);
	}
}

@ApiTags('First Version')
@Controller()
export class PartnerResourcesControllerOld {
	constructor(private partnerResourceService: PartnerResourcesService) {}
	@Get(['/stat', '/homepage_statistics'])
	async get_statistics() {
		// const resources = await this.partnerResourceService.get_resources();
		// const [achievement_count, count_biocurators, contributions_count] =
		// 	await this.partnerResourceService.get_counts();
		// return {
		// 	achievement_count,
		// 	count_biocurators,
		// 	contributions_count,
		// 	resources,
		// };
	}
}
