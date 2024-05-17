import { Model } from 'mongoose';
import { EntityRepository } from './abstract-repository';
import { InjectModel } from '@nestjs/mongoose';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../schemas/resource/partner-resource.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';

export class PartnerResourceRepository extends EntityRepository<PartnerResourceDocument> {
	constructor(
		@InjectModel(PartnerResource.name)
		resourceModel: Model<PartnerResourceDocument>,
		eventEmitter: EventEmitter2,
	) {
		super(resourceModel, eventEmitter);
	}
}
