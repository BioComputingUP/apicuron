import { LeanDocument } from 'mongoose';
import { User, UserDocument } from '../../../core/schemas/user.schema';
import { PrivacyType } from '../../../core/enums';

export const UserUpdatePrivacyEvent = 'on.user.update.privacy';
export interface IUserUpdatePrivacyEventPayload {
	user: UserDocument | LeanDocument<User>;
	privacy: PrivacyType;
}

export interface UserUpdatePrivacyEventHandler {
	handle(payload: IUserUpdatePrivacyEventPayload): Promise<void>;
}
