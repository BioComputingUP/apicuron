import {
	ConflictException,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
	NotImplementedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { join } from 'path';
// import { TransformerService } from '../../shared/transformer/transformer.service';
import { StorageService } from '@biocomputingup/nest-storage-manager';
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

	/**
	 * Turns a submitted resource into a partner resource, and makes its creator a manager.
	 * Safe to run again after a failure: submitted and partner resources share one collection,
	 * so the switch is a single update of the same document, and the logo is copied before it
	 * and only deleted from the private storage after it.
	 */
	async make_partner(resource_id: string) {
		const resource = await this.submittedResourceModel.findOne({ resource_id });
		if (!resource) {
			const approved = await this.partnerResourceModel.exists({ resource_id });
			throw approved
				? new ConflictException(`Resource ${resource_id} is already approved`)
				: new NotFoundException(`No submitted resource with id ${resource_id}`);
		}

		// adds the partner defaults (leagues, allowed hosts...) and fails before anything is changed
		// mongoose refuses to set the discriminator key, the new document has its own
		const { state: _state, ...resourceData } = resource.toObject();
		const partnerResource = new this.partnerResourceModel({
			...resourceData,
			joined_date: new Date(),
		});
		await partnerResource.validate();

		const logoPath = this.storageService.parseCanonicalUrl(resource.logo).path;
		const logoRef = await this.storageService.move(
			StorageType.private,
			StorageType.public,
			logoPath,
			{ deleteFromSource: false },
		);
		partnerResource.logo = this.storageService
			.getEngine(StorageType.public)
			.buildCanonicalUrl(logoRef);

		// through the driver, as mongoose casts an update against a single discriminator's schema
		const { _id, ...fields } = partnerResource.toObject();
		const { modifiedCount } = await this.resourceModel.collection.updateOne(
			{ _id, state: SubmittedResource.name },
			{
				$set: { ...fields, state: PartnerResource.name, updatedAt: new Date() },
			},
		);
		if (!modifiedCount) {
			throw new ConflictException(
				`Resource ${resource_id} changed while it was being approved, try again`,
			);
		}

		// the resource is live from here, so failures are logged and the approval goes on
		if (resource.creator) {
			try {
				await this.userService.addManagedResource(resource.creator, resource);
			} catch (e) {
				this.logger.error(
					`Approved ${resource_id} but could not make ${resource.creator} a manager, add them from the Managers tab`,
					e.stack,
				);
			}
		}

		try {
			await this.storageService.getEngine(StorageType.private).delete(logoPath);
		} catch (e) {
			this.logger.warn(
				`Approved ${resource_id} but could not delete its private logo ${logoPath}`,
			);
		}
	}

	delete_old_resources() {
		throw new NotImplementedException();
	}
}
