import { LeanDocument } from 'mongoose';
import { User, UserDocument } from '../../../core/schemas/user.schema';
import { PrivacyType } from '../../../core/enums';
import { PrivateUserEntity, UserEntity } from '../dto/user.entity';

export class UserPrivacyUpdatedEvent {
	constructor(
		public readonly user: UserDocument | LeanDocument<UserDocument> | PrivateUserEntity,
		public readonly privacy: PrivacyType,
	) {}
}
