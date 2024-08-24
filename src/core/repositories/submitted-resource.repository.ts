import { Model } from 'mongoose';
import { EntityRepository } from './entity-repository';
import { InjectModel } from '@nestjs/mongoose';
import {
	SubmittedResource,
	SubmittedResourceDocument,
} from '../schemas/resource/submitted-resource.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';

export class SubmittedResourceRepository extends EntityRepository<SubmittedResourceDocument> {
	constructor(
		@InjectModel(SubmittedResource.name)
		resourceModel: Model<SubmittedResourceDocument>,
		eventEmitter: EventEmitter2,
	) {
		super(resourceModel, eventEmitter);
	}
}
