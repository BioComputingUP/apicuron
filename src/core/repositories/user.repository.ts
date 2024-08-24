import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { EntityRepository } from './entity-repository';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
export class UserRepository extends EntityRepository<UserDocument> {
	constructor(
		@InjectModel(User.name) userModel: Model<UserDocument>,
		eventEmitter: EventEmitter2,
	) {
		super(userModel, eventEmitter);
	}
}
