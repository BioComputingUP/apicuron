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
import { PartnerResourceDocument } from 'src/core/schemas/resource/partner-resource.schema';
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
import { Request } from 'express';

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

		this.logger.debug(`Partner Resources retrieved`);

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
	@SerializeOptions({ type: PartnerResourceEntity })
	async update_resource_values(
		@Body() update_resource: UpdatePartnerResourceDto,
		@Req() request: Request,
		@UploadedFile(ResourceLogoValidationPipe(), SvgSanitationValidationPipe)
		logo: Express.Multer.File,
	) {
		this.logger.debug(
			`received leaderboard prefs: ${JSON.stringify(
				update_resource.leaderboard_preferences,
			)}`,
		);

		const { resource_id } = update_resource;
		// check if the user has a permission to edit the PartnerResource
		this.authService.user_has_resource(request.user, resource_id);

		const res: PartnerResourceDocument =
			await this.partnerResourceService.update_resource(update_resource, logo);
		return plainToInstance(PartnerResourceEntity, res, {
			excludeExtraneousValues: true,
			enableCircularCheck: true,
		});
	}
}
