import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { VisibilityType } from 'src/core/enums';
import { IUserEmailEntry } from '../../../auth/users/interfaces/user.interface';
import { OrcidEmailEntry } from '../../../orcid/orcid-client/interfaces/orcid.interface';

@Schema({
	_id: false,
})
export class UserEmailEntry implements OrcidEmailEntry, IUserEmailEntry {
	@Prop({
		required: true,
		default: VisibilityType.private,
	})
	visibility: VisibilityType;

	@Prop({
		required: true,
		default: false,
	})
	verified: boolean;

	@Prop({
		required: true,
		default: false,
	})
	primary: boolean;

	@Prop({
		required: true,
	})
	email: string;
}

export const UserEmailEntrySchema =
	SchemaFactory.createForClass(UserEmailEntry);
