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
} from '@nestjs/common';
import { createResourceDto } from '../dto/createResource.dto';
import { SubmittedResourcesService } from './resources.service';
import * as DOMPurify from 'isomorphic-dompurify';
import path, { join, extname } from 'path';
import { ConfigService } from '@nestjs/config';
import { uuid } from 'uuidv4';
import LocalFilesInterceptor from '../../global/interceptors/local-file.interceptor';
import { SvgSanitationValidationPipe } from '../../global/pipes/svg-sanitation.pipe';

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
	) // private configService: ConfigService,
	{}

	@Put()
	@UseInterceptors(
		LocalFilesInterceptor('logo', {
			public: true,
			path: 'resources',
		}),
	)
	async create_resource(
		@UploadedFile(resource_image_validation_pipe, SvgSanitationValidationPipe)
		logo,
		@Body() createResource: createResourceDto,
	) {
		// TODO: Add unique resource_id handling to prevent colliding names
		// TODO: make idempotent

		this.resourcesService.create_resource({
			...createResource,
			logo: logo.filename,
		});
	}
}
