import { LeanDocument } from 'mongoose';
import { User, UserDocument } from '../../../core/schemas/user.schema';
import { PrivacyType } from '../../../core/enums';

export class UserPrivacyUpdatedEvent {
	constructor(
		public readonly user: UserDocument | LeanDocument<UserDocument>,
		public readonly privacy: PrivacyType,
	) {}
}
