import {
	Injectable,
	Logger,
	NotImplementedException,
	BadRequestException,
	InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { rename, mkdir } from 'fs/promises';
import { Model } from 'mongoose';
import path, { basename, join } from 'path';
import { TransformerService } from '../../shared/transformer/transformer.service';
import { CreateResourceDto } from '../dto/createResource.dto';
import { PartnerResource, PartnerResourceDocument } from '../schemas/partner-resources.schema';
import { Resource, ResourceDocument } from '../schemas/resource.schema';
import {
	SubmittedResource,
	SubmittedResourceDocument,
} from '../schemas/submitted-resource.schema';

@Injectable()
export class SubmittedResourcesService {
	constructor(
		@InjectModel(SubmittedResource.name)
		private submittedResourceModel: Model<SubmittedResourceDocument>,
		@InjectModel(Resource.name)
		private resourceModel: Model<ResourceDocument>,
		protected configService: ConfigService,
	) { }

	private logger = new Logger(SubmittedResourcesService.name)

	private_logo_dir: string
	public_logo_dir: string

	async create_resource(
		resource_obj: CreateResourceDto & { logo: string },
		logo: Express.Multer.File,
	) {
		const res = new this.submittedResourceModel(resource_obj);

		res.save();
		return res.toObject();
	}

	async resource_id_taken(resource_id: string): Promise<Boolean> {
		return await !!this.submittedResourceModel.exists({ resource_id });
	}



	async make_partner(resource_id: string) {


		// retrieve the resource object
		const resource = await this.submittedResourceModel.findOne({ resource_id })

		// get the current logo path
		const logo_path = resource.logo.replace(this.configService.get('PUBLIC_FILES_URL_PATH'), this.configService.get('PRIVATE_FILES_PATH'))

		// move the logo from the PRIVATE_FILES_PATH to the PUBLIC_FILES_PATH
		try {
			rename(logo_path,
				join(this.configService.get('PUBLIC_FILES_PATH'), 'resources', basename(logo_path)),
			)
		} catch (err) {
			this.logger.error('Error moving logo file from private to public folder', err.stack, err.message)
		}

		await this.resourceModel.replaceOne({
			resource_id
		}, {
			...resource.toObject(),
			state: PartnerResource.name
		})


	}

	delete_old_resources() {
		throw new NotImplementedException();
	}
}
