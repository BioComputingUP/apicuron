import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { EntityRepository } from './abstract-repository';
import { InjectModel } from '@nestjs/mongoose';

export class UserRepository extends EntityRepository<UserDocument> {
	constructor(@InjectModel(User.name) userModel: Model<UserDocument>) {
		super(userModel);
	}
}
