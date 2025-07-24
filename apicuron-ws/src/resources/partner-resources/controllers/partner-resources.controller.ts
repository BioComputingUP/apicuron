import {
	Body,
	Controller,
	Get,
	InternalServerErrorException,
	Logger,
	NotFoundException,
	Param,
	Patch,
	Put,
	Req,
	SerializeOptions,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { SvgSanitationValidationPipe } from '../../../shared/pipes/svg-sanitation.pipe';

import { StorageService } from '@biocomputingup/nest-storage-manager/dist/services/storage.service';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
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
import { plainToInstance } from 'class-transformer';
import * as mime from 'mime-types';
import * as mv from 'mv';
import { join } from 'path';
import { AuthService } from '../../../auth/auth.service';
import { HasAResourceGuard } from '../../../auth/guards/belongs-to-resource.guard';
import { LocalAuthGuard } from '../../../auth/guards/local-auth.guard';
import { VersionHeader } from '../../../plugins/swagger/config';
import { ApiResponseWrapped } from '../../../shared/decorators/wrapped-data-response.decorator';
import {
	PartnerResourceEntity,
	SelectPartnerResourceDto,
} from '../../dto/partner-resources.entity';
import { PublicPartnerResourceDto } from '../../dto/public-partner-resource.dto';
import { UpdatePartnerResourceDto } from '../../dto/updateResource.dto';
import { ResourceLogoValidationPipe } from '../../validators/logo-validation.pipe';
import { PartnerResourcesService } from '../services/partner-resources.service';

@ApiTags('Partner Resources')
@ApiHeader(VersionHeader)
@Controller({ path: 'partner-resources', version: '2' })
export class PartnerResourcesController {
	constructor(
		private partnerResourceService: PartnerResourcesService,
		private configService: ConfigService,
		private authService: AuthService,
		private storage: StorageService,
	) {}

	logger = new Logger(PartnerResourcesController.name);

	@ApiResponseWrapped(
		[PartnerResourceEntity],
		200,
		'Returns a list of all the partner resources of APICURON',
	)
	@ApiOperation({
		summary: 'Get the list of all resources on APICURON',
	})
	@SerializeOptions({ type: PublicPartnerResourceDto })
	@Get()
	async list_resources(): Promise<PublicPartnerResourceDto[]> {
		const resources = await this.partnerResourceService.get_resources();

		const resourceEntities = plainToInstance(
			PublicPartnerResourceDto,
			resources.map((r) => r.toObject()),
			{
				excludeExtraneousValues: true,
				enableCircularCheck: true,
			},
		);

		console.log(`Parsed Data ${resourceEntities.map((r) => r.resource_name)}`);

		return resourceEntities;
	}

	// swagger documentation decorators
	@ApiOkResponse({
		description: 'The specified resource',
		type: PartnerResourceEntity,
	})
	@ApiOperation({
		summary: 'Get information about a single resource',
	})
	@ApiNotFoundResponse({
		description: 'A 404 Not Found Response and Error Message',
	})
	@SerializeOptions({ type: PartnerResourceEntity })
	@Get(':resource_id')
	async get_resource(@Param() { resource_id }: SelectPartnerResourceDto) {
		const resource = await this.partnerResourceService.get_resource(
			resource_id,
		);
		if (resource) {
			try {
				const data = plainToInstance(PartnerResourceEntity, resource, {
					excludeExtraneousValues: true,
					enableCircularCheck: true,
				});
				return data;
			} catch (error) {
				this.logger.error(`Failed to serialize resource ${resource_id}`);
				throw new InternalServerErrorException();
			}
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
		type: PartnerResourceEntity,
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
		const public_files_path =
			this.configService.getOrThrow<string>('PUBLIC_FILES_PATH');
		// if there's an uploaded file
		if (logo) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const ext = mime.extension(logo.mimetype);
			const public_path = join(
				public_files_path,
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
				public_files_path,
				this.configService.getOrThrow('PUBLIC_FILES_URL_PATH'),
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
