import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PrivacyType } from '../../enums';

@Schema({
	_id: false,
})
export class UserResourceSpecificSettings {
	@Prop({
		required: true,
		default: () => PrivacyType.public,
	})
	privacy: PrivacyType;
}

export const UserResourceSpecificSettingsSchema = SchemaFactory.createForClass(
	UserResourceSpecificSettings,
);
