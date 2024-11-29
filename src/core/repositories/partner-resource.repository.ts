import { Model } from 'mongoose';
import { EntityRepository } from './entity-repository';
import { InjectModel } from '@nestjs/mongoose';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../schemas/resource/partner-resource.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
	EntityCreatedEvent,
	EntityUpdatedEvent,
	EntityDeletedEvent,
	ManyEntityUpdated,
} from '../events';

export class PartnerResourceRepository extends EntityRepository<PartnerResourceDocument> {
	constructor(
		@InjectModel(PartnerResource.name)
		resourceModel: Model<PartnerResourceDocument>,
		eventEmitter: EventEmitter2,
	) {
		super(resourceModel, eventEmitter);
	}

	static EntityCreatedEvent = EntityCreatedEvent.getModelEventName(
		PartnerResourceRepository,
	);
	static EntityUpdatedEvent = EntityUpdatedEvent.getModelEventName(
		PartnerResourceRepository,
	);
	static EntityDeletedEvent = EntityDeletedEvent.getModelEventName(
		PartnerResourceRepository,
	);
	static ManyEntityUpdatedEvent = ManyEntityUpdated.getModelEventName(
		PartnerResourceRepository,
	);
}
