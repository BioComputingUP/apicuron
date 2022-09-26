import { Injectable, NotImplementedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { TransformerService } from '../../global/transformer/transformer.service';
import { createResourceDto } from '../dto/createResource.dto';
import { Resource, ResourceDocument } from '../schemas/resource.schema';
import {
	SubmittedResource,
	SubmittedResourceDocument,
} from '../schemas/submitted-resource.schema';

@Injectable()
export class SubmittedResourcesService {
	constructor(
		@InjectModel(SubmittedResource.name)
		private resourceModel: Model<SubmittedResourceDocument>,
		private transformerService: TransformerService,
	) {}

	create_resource(resource_obj: createResourceDto & { logo: string }) {
		const res = new this.resourceModel(resource_obj);
		const resource = this.resourceModel.findOne({
			resource_id: resource_obj.resource_id,
		});
		if (!!resource) {
			this.transformerService.warn(
				'resource',
				"This resource_id exists already can can't be overwritten. Please contact the developer",
			);
			return resource;
		}
		res.save();
		return res;
	}


	@Cron(CronExpression.EVERY_WEEK)
	delete_old_resources() {
		throw new NotImplementedException();
	}
}
