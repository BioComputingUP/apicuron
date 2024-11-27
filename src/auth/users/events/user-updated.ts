import { LeanDocument, UpdateQuery } from 'mongoose';
import { UserDocument } from '../../../core/schemas/user.schema';

export class UserUpdatedEvent {
	constructor(
		public readonly before: UserDocument | LeanDocument<UserDocument>,
		public readonly after: UserDocument | LeanDocument<UserDocument>,
		public readonly update: UpdateQuery<UserDocument>,
		public readonly date: Date = new Date(),
	) {}
}
