import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { Report } from './reports.schema';
import { PrivacyType } from './activity-category.schema';

export type UserDocument = User & Document;
export interface UserResource {
	id: string;
	name: string;
	resource_id: string;
}

export interface UserResourcePutCode {
	resource_id: string;
	putCode: string;
}

@Schema({
	collection: 'users',
	toJSON: {
		virtuals: true,
	},
	// methods: {
	// 	hasResourcePutCode: function (resource_id: string): Boolean {
	// 		return this.orcid_work_put_codes.findIndex((item) => item.resource_id == resource_id) != -1;
	// 	},
	// 	getResourcePutCode: function (resource_id: string): string {
	// 		return this.orcid_work_put_codes.find((item) => item.resource_id == resource_id).putCode;
	// 	}
	// }
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
		required: true,
		default: PrivacyType.private,
		type: String,
		enum: PrivacyType,
	})
	privacy: PrivacyType;

	hasResourcePutCode: (resource_id: string) => boolean;
	getResourcePutCode: (resource_id: string) => string;
}

const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('reports', {
	ref: Report.name,
	localField: 'orcid_id',
	foreignField: 'curator_orcid',
});

UserSchema.method(
	'hasResourcePutCode',
	function (resource_id: string): boolean {
		return (
			this.orcid_work_put_codes.findIndex(
				(item) => item.resource_id == resource_id,
			) != -1
		);
	},
);

UserSchema.method('getResourcePutCode', function (resource_id: string): string {
	return this.orcid_work_put_codes.find(
		(item) => item.resource_id == resource_id,
	).putCode;
});

// UserSchema.methods.hasResourcePutCode = function (resource_id: string): Boolean {
// return this.orcid_work_put_codes.find((item) => item.resource_id == resource_id) != -1;
// }

export { UserSchema };
