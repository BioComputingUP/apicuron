import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
	PartnerResource,
	PartnerResourceDocument,
	ResourceSummary,
} from '../schemas/partner-resources.schema';
// import { TransformerService } from '../../shared/transformer/transformer.service';
import { UpdatePartnerResourceDto } from '../dto/updateResource.dto';

@Injectable()
export class PartnerResourcesService {
	constructor(
		@InjectModel(PartnerResource.name)
		private partnerResourceModel: Model<PartnerResourceDocument>,
		// protected transformService: TransformerService
	) {}
	async get_resources(): Promise<PartnerResource[]> {
		return await this.partnerResourceModel.find();
	}

	async count() {
		return await this.partnerResourceModel.count();
	}

	async retrieve_uri(resource_id: string){
		const resource = await this.partnerResourceModel.findOne({ resource_id })
		if(!resource){
			// this.transformService.warn('resource_id', `Incorrect resource_id: ${resource_id} Not found, parameter ignored`)
			return null
		}else{
			return resource.resource_uri
		}
	}

	async get_resource(resource_id: string){
		return await this.partnerResourceModel.findOne({ resource_id })
	}

	async exists(resource_id: string): Promise<Boolean> {
		return !! await this.partnerResourceModel.exists({ resource_id })
	}

	async update_resource(resource_update: UpdatePartnerResourceDto & { logo?: string }){
		const { resource_id } = resource_update

		return await this.partnerResourceModel.updateOne({ resource_id }, resource_update);

	}
}
