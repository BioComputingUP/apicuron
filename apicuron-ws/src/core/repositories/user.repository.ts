import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import {
	EntityCreatedEvent,
	EntityDeletedEvent,
	EntityUpdatedEvent,
	ManyEntityUpdated,
} from '../events/index';
import { User, UserModel } from '../schemas/user.schema';
import { EntityRepository } from './entity-repository';

export class UserCreatedEvent extends EntityCreatedEvent<User> {}
export class UserUpdatedEvent extends EntityUpdatedEvent<User> {}
export class UserDeletedEvent extends EntityDeletedEvent<User> {}
export class ManyUserUpdatedEvent extends ManyEntityUpdated<User> {}

export class UserRepository extends EntityRepository<User, UserModel> {
	constructor(
		@InjectModel(User.name) userModel: UserModel,
		protected readonly eventEmitter: EventEmitter2,
	) {
		super(userModel);
		this.publisher.pushToEventEmitter(this.eventEmitter, [
			[EntityCreatedEvent.name, UserCreatedEvent.name],
			[EntityUpdatedEvent.name, UserUpdatedEvent.name],
			[EntityDeletedEvent.name, UserDeletedEvent.name],
			[ManyEntityUpdated.name, ManyUserUpdatedEvent.name],
		]);
	}
}
