import { LeanDocument } from 'mongoose';
import { UserDocument } from '../../../core/schemas/user.schema';

export class UserCreatedEvent {
	constructor(
		public readonly user: UserDocument | LeanDocument<UserDocument>,
		public readonly date: Date = new Date(),
	) {}
}
