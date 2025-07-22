import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModel } from 'src/core/schemas/user.schema';

@Injectable()
export class UsersEventHandlers {
	constructor(@InjectModel(User.name) protected userModel: UserModel) {}

	logger = new Logger(UsersEventHandlers.name);
}
