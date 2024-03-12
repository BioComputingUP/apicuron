import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { Report } from './reports.schema';
import {
	UserResourceSpecificSettings,
	UserResourceSpecificSettingsSchema,
} from './components/user-settings.schema';
import { PrivacyType } from '../enums';
import { UserResource } from '../interfaces/user-resource';
import { UserResourcePutCode } from '../interfaces/user-resource-put-code';
export type UserDocument = HydratedDocument<User>;

@Schema({
	collection: 'users',
	toJSON: {
		virtuals: true,
	},
})
export class User {
	@Prop({
		select: false,
	})
	id: Types.ObjectId;

	@Prop()
	biography?: string;

	@Prop({
		select: false,
	})
	cookie_token: string;

	@Prop()
	displayedName: string;

	@Prop()
	email?: string;

	/// Could not determine type the field only had null or empty values in the sample set.
	@Prop({
		required: false,
		type: SchemaTypes.String,
	})
	employment?: string;

	@Prop()
	family_name?: string;

	@Prop()
	full_name?: string;

	@Prop()
	given_name?: string;

	@Prop()
	gmail?: string;

	@Prop({
		required: false,
	})
	institution?: string;

	@Prop({ select: false })
	jwt_token: string;

	/// Could not determine type the field only had null or empty values in the sample set.
	@Prop()
	keywords?: string;

	@Prop({
		default: Date.now(),
		type: Date,
	})
	last_update: Date;

	@Prop({ required: true, default: () => 'user' })
	role: 'user' | 'admin';

	@Prop()
	username: string;

	@Prop({ required: true, unique: true })
	orcid_id: string;

	@Prop({
		select: true,
	})
	orcid_permission: string;

	@Prop({
		required: false,
	})
	orcid_scope?: string;

	@Prop({
		required: false,
	})
	orcid_work_put_codes: UserResourcePutCode[] = [];

	@Prop({ required: false, select: true })
	resources: UserResource[];

	@Prop({
		required: true,
		default() {
			return [];
		},
	})
	contributed_to: string[];

	@Prop({ required: false })
	refresh_token?: string;

	@Prop({ required: true })
	avatar: string;

	@Prop({
		type: Map,
		of: UserResourceSpecificSettingsSchema,
		default: () => new Map(),
	})
	resource_settings: Map<string, UserResourceSpecificSettings>;

	@Prop({
		required: true,
		default: PrivacyType.private,
		type: String,
		enum: PrivacyType,
	})
	privacy: PrivacyType;

	hasResourcePutCode(resource_id: string): boolean {
		return (
			this.orcid_work_put_codes.findIndex(
				(item) => item.resource_id == resource_id,
			) != -1
		);
	}
	getResourcePutCode(resource_id: string): {
		putCode: string;
		resource_id: string;
	} {
		return this.orcid_work_put_codes.find(
			(item) => item.resource_id == resource_id,
		);
	}

	setResourcePutCode(resource_id: string, putCode: string): void {
		if (this.hasResourcePutCode(resource_id)) {
			this.getResourcePutCode(resource_id).putCode = putCode;
		} else {
			this.orcid_work_put_codes.push({
				resource_id,
				putCode,
			});
		}
	}

	getResourceSettings(resource_id: string): UserResourceSpecificSettings {
		return {
			privacy: this.resource_settings.get(resource_id)?.privacy || this.privacy,
		};
	}
}

const UserSchema = SchemaFactory.createForClass(User).loadClass(User);

UserSchema.loadClass(User);

UserSchema.virtual('reports', {
	ref: Report.name,
	localField: 'orcid_id',
	foreignField: 'curator_orcid',
});

export { UserSchema };
