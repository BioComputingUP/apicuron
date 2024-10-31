import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { rename } from 'fs/promises';
import { Model } from 'mongoose';
import { basename, join } from 'path';
import { User, UserDocument } from '../../core/schemas/user.schema';
// import { TransformerService } from '../../shared/transformer/transformer.service';
import { CreateResourceDto } from '../dto/createResource.dto';
import {
	Resource,
	ResourceDocument,
} from '../../core/schemas/resource/resource.schema';
import {
	SubmittedResource,
	SubmittedResourceDocument,
} from '../../core/schemas/resource/submitted-resource.schema';
import { PartnerResource } from '../../core/schemas/resource/partner-resource.schema';

@Injectable()
export class SubmittedResourcesService {
	constructor(
		@InjectModel(SubmittedResource.name)
		private submittedResourceModel: Model<SubmittedResourceDocument>,
		@InjectModel(Resource.name)
		private resourceModel: Model<ResourceDocument>,
		@InjectModel(User.name)
		private userModel: Model<UserDocument>,
		protected configService: ConfigService,
	) {}

	private logger = new Logger(SubmittedResourcesService.name);

	private_logo_dir: string;
	public_logo_dir: string;

	async create_resource(
		resource_obj: CreateResourceDto & { logo: string },
		creator: string,
	) {
		const res = new this.submittedResourceModel({ ...resource_obj, creator });

		res.save();
		return res.toObject();
	}

	async list_submitted_resources() {
		return await this.submittedResourceModel.find();
	}

	async resource_id_taken(resource_id: string): Promise<boolean> {
		return await !!this.submittedResourceModel.exists({ resource_id });
	}

	async make_partner(resource_id: string) {
		// retrieve the resource object
		const resource = await this.submittedResourceModel.findOne({ resource_id });

		// get the current logo path
		const logo_path = resource.logo.replace(
			this.configService.get('PUBLIC_FILES_URL_PATH'),
			this.configService.get('PRIVATE_FILES_PATH'),
		);

		// move the logo from the PRIVATE_FILES_PATH to the PUBLIC_FILES_PATH
		try {
			rename(
				logo_path,
				join(
					this.configService.get('PUBLIC_FILES_PATH'),
					'resources',
					basename(logo_path),
				),
			);
		} catch (err) {
			this.logger.error(
				'Error moving logo file from private to public folder',
				err.stack,
				err.message,
			);
		}

		// if the submitted resource has a creator, we set it as an owner of the resource
		const { creator, resource_name } = resource;
		if (creator) {
			await this.userModel.updateOne(
				{
					orcid_id: creator,
				},
				{
					$push: {
						resources: {
							resource_id,
							name: resource_name,
						},
					},
				},
			);
		}

		await this.resourceModel.replaceOne(
			{
				resource_id,
			},
			{
				...resource.toObject(),
				joined_date: new Date(),
				state: PartnerResource.name,
			},
		);
	}

	delete_old_resources() {
		throw new NotImplementedException();
	}
}
