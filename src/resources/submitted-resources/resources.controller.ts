import {
	Body,
	Controller,
	Get,
	Post,
	Put,
	UploadedFile,
	UseInterceptors,
	UnprocessableEntityException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import multer, { MulterError } from 'multer';
import {
	ParseFilePipe,
	MaxFileSizeValidator,
	FileTypeValidator,
	Logger,
	InternalServerErrorException
} from '@nestjs/common';
import { createResourceDto } from '../dto/createResource.dto';
import { SubmittedResourcesService } from './resources.service';
import * as DOMPurify from 'isomorphic-dompurify';
import path, { join, extname } from 'path';
import { ConfigService } from '@nestjs/config';
import { uuid } from 'uuidv4';
import LocalFilesInterceptor from '../../shared/interceptors/local-file.interceptor';
import { SvgSanitationValidationPipe } from '../../shared/pipes/svg-sanitation.pipe';
import { rename, writeFile } from 'fs';
import * as mime from 'mime-types'

const resource_image_validation_pipe = new ParseFilePipe({
	validators: [
		new MaxFileSizeValidator({ maxSize: 1000000 }),
		new FileTypeValidator({
			fileType: /(^image)(\/)(jpeg|png|svg\+xml|webp)*/gm,
		}),
	],
});

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

	// @UseInterceptors(
	// 	LocalFilesInterceptor('logo', {
	// 		public: true,
	// 		path: 'resources',
	// 	}),
	// )

	@Put()
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
