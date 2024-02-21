import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../core/schemas/user.schema';

@Injectable()
export class UsersEventHandlers {
	constructor(
		@InjectModel(User.name) protected userModel: Model<UserDocument>,
	) {}

	logger = new Logger(UsersEventHandlers.name);
}
