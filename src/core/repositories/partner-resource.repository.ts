import { EntityRepository } from './entity-repository';
import { InjectModel } from '@nestjs/mongoose';
import {
	PartnerResource,
	PartnerResourceModel,
} from '../schemas/resource/partner-resource.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
	EntityCreatedEvent,
	EntityUpdatedEvent,
	EntityDeletedEvent,
	ManyEntityUpdated,
} from '../events';

export class PartnerResourceCreatedEvent extends EntityCreatedEvent<PartnerResource> {}
export class PartnerResourceUpdatedEvent extends EntityUpdatedEvent<PartnerResource> {}
export class PartnerResourceDeletedEvent extends EntityDeletedEvent<PartnerResource> {}
export class ManyPartnerResourceUpdatedEvent extends ManyEntityUpdated<PartnerResource> {}
export class PartnerResourceRepository extends EntityRepository<
	PartnerResource,
	PartnerResourceModel
> {
	constructor(
		@InjectModel(PartnerResource.name)
		resourceModel: PartnerResourceModel,
		eventEmitter: EventEmitter2,
	) {
		super(resourceModel);
		this.publisher.pushToEventEmitter(eventEmitter, [
			[EntityCreatedEvent.name, PartnerResourceCreatedEvent.name],
			[EntityUpdatedEvent.name, PartnerResourceUpdatedEvent.name],
			[EntityDeletedEvent.name, PartnerResourceDeletedEvent.name],
			[ManyEntityUpdated.name, ManyPartnerResourceUpdatedEvent.name],
		]);
	}
}
