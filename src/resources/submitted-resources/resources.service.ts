import {
	Injectable,
	InternalServerErrorException,
	Logger,
	NotImplementedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { join } from 'path';
// import { TransformerService } from '../../shared/transformer/transformer.service';
import { StorageService } from '@biocomputingup/nest-storage-manager/dist/services/storage.service';
import { UsersService } from '../../auth/users/services/users.service';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../core/schemas/resource/partner-resource.schema';
import {
	Resource,
	ResourceDocument,
} from '../../core/schemas/resource/resource.schema';
import {
	SubmittedResource,
	SubmittedResourceDocument,
} from '../../core/schemas/resource/submitted-resource.schema';
import { StorageType } from '../../storage/storage.config';
import { FileUploadDto } from '../../util/file-upload.helper';
import { CreateResourceDto } from '../dto/createResource.dto';

@Injectable()
export class SubmittedResourcesService {
	constructor(
		@InjectModel(SubmittedResource.name)
		private submittedResourceModel: Model<SubmittedResourceDocument>,
		@InjectModel(Resource.name)
		private resourceModel: Model<ResourceDocument>,
		@InjectModel(PartnerResource.name)
		private partnerResourceModel: Model<PartnerResourceDocument>,
		private userService: UsersService,
		protected configService: ConfigService,
		protected storageService: StorageService,
	) {}

	private logger = new Logger(SubmittedResourcesService.name);

	private_logo_dir: string;
	public_logo_dir: string;

	async create_resource(
		resource_obj: CreateResourceDto,
		creator: string,
		resourceLogo: FileUploadDto,
	) {
		try {
			const privateEngine = this.storageService.getEngine(StorageType.private);

			const logoReference = await privateEngine.put(
				join('resources', resourceLogo.filename),
				resourceLogo.buffer,
			);

			const res = new this.submittedResourceModel({
				...resource_obj,
				creator,
				logo: logoReference,
			});

			await res.save();
			return res.toObject();
		} catch (err) {
			this.logger.error('Error creating resource', err.stack, err.message);
			throw new InternalServerErrorException('Error creating resource');
		}
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
		if (!resource) {
			throw new Error(`Resource with id ${resource_id} not found`);
		}

		const logoRef = await this.storageService.move(
			StorageType.private,
			StorageType.public,
			this.storageService.parseCanonicalUrl(resource.logo).path,
			{ deleteFromSource: true },
		);
		const newLogoRef = this.storageService
			.getEngine(StorageType.public)
			.buildCanonicalUrl(logoRef);
		this.logger.debug(`Moved logo from private to public: ${newLogoRef}`);

		const resourceData = resource.toObject();
		const partnerResource = new this.partnerResourceModel({
			...resourceData,
			logo: newLogoRef,
			joined_date: new Date(),
		});

		await this.submittedResourceModel.deleteOne({ resource_id });

		await this.partnerResourceModel.create(partnerResource.toObject());

		this.logger.debug(
			`Creating PartnerResource with logo ${partnerResource.logo}`,
		);

		// if the submitted resource has a creator, we set it as an owner of the resource
		const { creator } = resource;
		if (creator) {
			await this.userService.addManagedResource(creator, resource);
		}
	}

	delete_old_resources() {
		throw new NotImplementedException();
	}
}
