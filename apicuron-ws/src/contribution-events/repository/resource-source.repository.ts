import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../core/schemas/resource/partner-resource.schema';
import { SourceSystem } from '../../core/schemas/components/resource-source.schema';

export interface LinkedResource {
	resource_id: string;
    // resource_uri?: string
}

@Injectable()
export class ResourceSourceRepository {
	constructor(
		@InjectModel(PartnerResource.name)
		private readonly resourceModel: Model<PartnerResourceDocument>,
	) {}

	async findBySource(system: SourceSystem, repositoryId: string): Promise<LinkedResource | null> {
		const resource = await this.resourceModel
			.findOne(
				{ 'sources.system': system, 'sources.repository_id': repositoryId },
				{ resource_id: 1 },
			)
			.lean();
		return resource ? { resource_id: resource.resource_id } : null;
	}
}