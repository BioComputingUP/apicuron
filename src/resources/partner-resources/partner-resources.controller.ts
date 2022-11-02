import {
	Controller,
	Get,
	Param,
	Query,
	Req,
	UploadedFile,
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

const resource_image_validation_pipe = new ParseFilePipe({
	validators: [
		new MaxFileSizeValidator({ maxSize: 1000000 }),
		new FileTypeValidator({
			fileType: /(^image)(\/)(jpeg|png|svg\+xml|webp)*/gm,
		}),
	],
	fileIsRequired: false,
});

@Controller({ path: 'partner-resources', version: '2' })
export class PartnerResourcesController {
	constructor(
		private partnerResourceService: PartnerResourcesService,
		private userService: UsersService,
		private configService: ConfigService,
	) {}

	logger = new Logger(PartnerResourcesController.name)
	// @Get('details')
	// async get_resources(): Promise<PartnerResourceSummaryDto[]> {
	// 	return await this.partnerResourceService.resources_details();
	// }

	@Get()
	async list_resources() {
		return await this.partnerResourceService.get_resources();
	}

	// @Get('details/:resource_id')
	// async get_resource_details(
	// 	@Param('resource_id') resource_id,
	// 	@Query('page') page = 1,
	// 	@Query('page_size') page_size = 10,
	// ) {
	// 	const resource_obj = await this.partnerResourceService.get_resource_details(
	// 		resource_id,
	// 		page,
	// 		page_size,
	// 	);
	// 	if (!resource_obj) {
	// 		throw new NotFoundException('Invalid resource_id');
	// 	}
	// 	const { resource, ...other } = resource_obj;

	// 	return {
	// 		data: {
	// 			...resource,
	// 			...other,
	// 		},
	// 		reports_page: page,
	// 		page_size: page_size,
	// 	};
	// }

	@Get(':resource_id')
	async get_resource(@Param('resource_id') resource_id){
		return this.partnerResourceService.get_resource(resource_id);
	}

	@Put('update')
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
		const user = await this.userService.get_by_orcid(request.user.orcid_id);

		const user_resource = user.resources.find(
			(resource) => resource.resource_id == update_resource.resource_id,
		);
		if (!user_resource) {
			throw new UnauthorizedException('Cannot update this resource');
		}

		const { resource_id } = update_resource;

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

			await this.partnerResourceService.update_resource({...update_resource, logo: public_path });
		}else{
			await this.partnerResourceService.update_resource(update_resource);
		}


		return await this.partnerResourceService.get_resource(resource_id);
	}
}

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
