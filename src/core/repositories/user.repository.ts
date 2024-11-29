import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { EntityRepository } from './entity-repository';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
	EntityCreatedEvent,
	EntityUpdatedEvent,
	EntityDeletedEvent,
	ManyEntityUpdated,
} from '../events';
export class UserRepository extends EntityRepository<UserDocument> {
	constructor(
		@InjectModel(User.name) userModel: Model<UserDocument>,
		eventEmitter: EventEmitter2,
	) {
		super(userModel, eventEmitter);
	}

	static EntityCreatedEvent =
		EntityCreatedEvent.getModelEventName(UserRepository);
	static EntityUpdatedEvent =
		EntityUpdatedEvent.getModelEventName(UserRepository);
	static EntityDeletedEvent =
		EntityDeletedEvent.getModelEventName(UserRepository);
	static ManyEntityUpdatedEvent =
		ManyEntityUpdated.getModelEventName(UserRepository);
}
