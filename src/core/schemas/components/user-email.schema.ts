import { OrcidEmailEntry } from '../../../orcid-client/interfaces/orcid.interface';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class UserEmailEntry implements OrcidEmailEntry {
	@Prop({
		required: true,
		default: 'limited',
	})
	visibility: string;

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
