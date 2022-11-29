import {
	Body,
	Controller,
	Post,
	HttpCode,
	Put,
	Param,
	UploadedFile,
	UseInterceptors,
	ParseFilePipe,
	MaxFileSizeValidator,
	FileTypeValidator,
	Logger,
	InternalServerErrorException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateResourceDto } from '../dto/createResource.dto';
import { SubmittedResourcesService } from './resources.service';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { SvgSanitationValidationPipe } from '../../shared/pipes/svg-sanitation.pipe';
import { writeFile, rename } from 'fs';
import * as mime from 'mime-types'
import { ApiCreatedResponse, ApiResponse, ApiTags } from '@nestjs/swagger';

const resource_image_validation_pipe = new ParseFilePipe({
	validators: [
		new MaxFileSizeValidator({ maxSize: 1000000 }),
		new FileTypeValidator({
			fileType: /(^image)(\/)(jpeg|png|svg\+xml|webp)*/gm,
		}),
	],
});

@ApiTags('Resources')
@Controller({
	version: '2',
	path: 'resources',
})
export class SubmittedResourcesController {
	constructor(
		private resourcesService: SubmittedResourcesService,
		private configService: ConfigService,
	) 
	{}

	private readonly logger = new Logger(SubmittedResourcesController.name)
	
	@ApiCreatedResponse({
		status: 201,
		description: 'Returns a confirmation value of the created resource',
		type: CreateResourceDto
	})
	@Put()
	@HttpCode(201)
	@UseInterceptors(FileInterceptor('logo', {
		dest: '/tmp/apicuron/submitted_resources/',
	}))
	async create_resource(
		@Body() createResource: CreateResourceDto,
		@UploadedFile(resource_image_validation_pipe, SvgSanitationValidationPipe)
		logo: Express.Multer.File,
	) {
		const ext = mime.extension(logo.mimetype)
		const filename = `logo-${createResource.resource_id}.${ext}`;
		const file_path = join(this.configService.get('PRIVATE_FILES_PATH'), 'resources',filename)
		
		rename(logo.path, file_path, (err) => {
			if(err){
				this.logger.error(err)
			}
		})

		return this.resourcesService.create_resource({
			...createResource,
			logo: filename,
		}, logo);
	}

}
