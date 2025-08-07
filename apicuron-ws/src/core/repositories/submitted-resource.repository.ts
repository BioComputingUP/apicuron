import { InjectModel } from '@nestjs/mongoose';
import {
	SubmittedResource,
	SubmittedResourceModel,
} from '../schemas/resource/submitted-resource.schema';
import { EntityRepository } from './entity-repository';

export class SubmittedResourceRepository extends EntityRepository<
	SubmittedResource,
	SubmittedResourceModel
> {
	constructor(
		@InjectModel(SubmittedResource.name)
		resourceModel: SubmittedResourceModel,
	) {
		super(resourceModel);
	}
}
