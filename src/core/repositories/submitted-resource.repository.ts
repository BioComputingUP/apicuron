import { Model } from 'mongoose';
import { EntityRepository } from './abstract-repository';
import { InjectModel } from '@nestjs/mongoose';
import {
	SubmittedResource,
	SubmittedResourceDocument,
} from '../schemas/resource/submitted-resource.schema';

export class SubmittedResourceRepository extends EntityRepository<SubmittedResourceDocument> {
	constructor(
		@InjectModel(SubmittedResource.name)
		resourceModel: Model<SubmittedResourceDocument>,
	) {
		super(resourceModel);
	}
}
