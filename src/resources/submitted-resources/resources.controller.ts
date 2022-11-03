import {
	Body,
	Controller,
	Get,
	HttpCode,
	Put,
	UploadedFile,
	UseInterceptors,
	ParseFilePipe,
	MaxFileSizeValidator,
	FileTypeValidator,
	Logger,
	InternalServerErrorException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { createResourceDto } from '../dto/createResource.dto';
import { SubmittedResourcesService } from './resources.service';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { SvgSanitationValidationPipe } from '../../shared/pipes/svg-sanitation.pipe';
import { writeFile } from 'fs';
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
		type: createResourceDto
	})
	@Put()
	@HttpCode(201)
	@UseInterceptors(FileInterceptor('logo'))
	async create_resource(
		@Body() createResource: createResourceDto,
		@UploadedFile(resource_image_validation_pipe, SvgSanitationValidationPipe)
		logo: Express.Multer.File,
	) {
		const ext = mime.extension(logo.mimetype)
		const filename = `logo-${createResource.resource_id}.${ext}`;
		const file_path = join(this.configService.get('PUBLIC_FILES_PATH'), 'resources',filename)

		writeFile(file_path, logo.buffer, (err) => {
			if (err) {
				this.logger.error(err, err.stack)
				throw new InternalServerErrorException('Internal Server Error')	
			}else{
				this.logger.log(`Resource File ${file_path} Saved successfully`)
			}
		})

		return this.resourcesService.create_resource({
			...createResource,
			logo: filename,
		}, logo);
	}
}
