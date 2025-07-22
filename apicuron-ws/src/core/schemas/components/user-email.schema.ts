import { VisibilityType } from 'src/core/enums';
import { IUserEmailEntry } from '../../../auth/users/interfaces/user.interface';
import { OrcidEmailEntry } from '../../../orcid/orcid-client/interfaces/orcid.interface';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
	_id: false,
})
export class UserEmailEntry implements OrcidEmailEntry, IUserEmailEntry {
	@Prop({
		required: true,
		default: VisibilityType.limited,
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
