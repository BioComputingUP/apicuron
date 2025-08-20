import { Prop, Schema as SchemaDec, SchemaFactory } from '@nestjs/mongoose';
import {
	FilterQuery,
	HydratedDocument,
	LeanDocument,
	Model,
	ProjectionType,
	QueryOptions,
	Types,
} from 'mongoose';

import { PrivacyType } from '../enums';
import { UserResource } from '../interfaces/user-resource';
import { UserResourcePutCode } from '../interfaces/user-resource-put-code';
import {
	UserEmailEntry,
	UserEmailEntrySchema,
} from './components/user-email.schema';
import {
	UserEmployment,
	UserEmploymentSchema,
	UserLinks,
	UserLinksSchema,
} from './components/user-fields.schema';

export type UserDocumentOverride = {
	emails: Types.DocumentArray<UserEmailEntry>;
	employment: Types.DocumentArray<UserEmployment>;
	links: Types.DocumentArray<UserLinks>;
	hasResourcePutCode(resource_id: string): boolean;
	getResourcePutCode(resource_id: string): {
		putCode: string;
		resource_id: string;
	} | null;
	setResourcePutCode(resource_id: string, putCode: string): void;
};

export type UserDocument = HydratedDocument<User, UserDocumentOverride>;
export type UserModel = Model<User, unknown, UserDocumentOverride>;
export type UserFilter = FilterQuery<User>;
export type UserProjection = ProjectionType<User>;
export type UserQueryOptions = QueryOptions<User>;
export type LeanUserDoc = LeanDocument<User>;

@SchemaDec({
	collection: 'users',
	toJSON: {
		virtuals: true,
	},
	optimisticConcurrency: true,
	methods: {
		hasResourcePutCode(this: UserDocument, resource_id: string): boolean {
			return (
				this.orcid_work_put_codes.findIndex(
					(item) => item.resource_id == resource_id,
				) != -1
			);
		},
		getResourcePutCode(
			this: UserDocument,
			resource_id: string,
		):
			| {
					putCode: string;
					resource_id: string;
			  }
			| null
			| undefined {
			return this.orcid_work_put_codes.find(
				(item) => item.resource_id == resource_id,
			);
		},

		setResourcePutCode(
			this: UserDocument,
			resource_id: string,
			putCode: string,
		): void {
			if (this.hasResourcePutCode(resource_id)) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				this.getResourcePutCode(resource_id)!.putCode = putCode;
			} else {
				this.orcid_work_put_codes.push({
					resource_id,
					putCode,
				});
			}
		},
	},
})
export class User {
	// @Prop({
	// 	select: false,
	// })
	// id: Types.ObjectId;

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

	// Emails obtained from orcid
	@Prop({
		type: [UserEmailEntrySchema],
		default: [],
		required: true,
	})
	emails: UserEmailEntry[];

	/// Could not determine type the field only had null or empty values in the sample set.
	@Prop({
		required: false,
		type: [UserEmploymentSchema],
		default: () => [],
	})
	employment: UserEmployment[];

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
	jwt_token?: string;

	@Prop({
		required: false,
	})
	affiliation?: string;

	@Prop({
		required: false,
		type: [UserLinksSchema],
		default: () => [],
	})
	links: UserLinks[];
	/// Could not determine type the field only had null or empty values in the sample set.
	@Prop({
		required: false,
		default: () => [],
		type: [String],
	})
	keywords?: string[];

	@Prop({
		default: Date.now(),
		type: Date,
	})
	last_update: Date;

	@Prop({ required: true, default: () => 'user' })
	role: 'user' | 'admin';

	@Prop()
	username: string;

	@Prop({ required: true })
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

	// @Prop({
	// 	required: true,
	// 	default() {
	// 		return [];
	// 	},
	// })
	// contributed_to: string[];

	@Prop({ required: false })
	refresh_token?: string;

	@Prop({ required: true, type: String })
	avatar: string;

	@Prop({
		required: true,
		default: PrivacyType.private,
		type: String,
		enum: PrivacyType,
	})
	privacy: PrivacyType;

	@Prop({ default: true })
	isNewLogin?: boolean;

	@Prop({ required: false, default: Date.now() })
	lastLoginDate?: Date;

	@Prop({ required: false, default: false })
	acceptsEmails?: boolean;

	// THese methods are commented out because they are added to the schema decorator using the methods property.
	// hasResourcePutCode(resource_id: string): boolean {
	// 	return (
	// 		this.orcid_work_put_codes.findIndex(
	// 			(item) => item.resource_id == resource_id,
	// 		) != -1
	// 	);
	// }
	// getResourcePutCode(resource_id: string): {
	// 	putCode: string;
	// 	resource_id: string;
	// } | null {
	// 	return this.orcid_work_put_codes.find(
	// 		(item) => item.resource_id == resource_id,
	// 	);
	// }

	// setResourcePutCode(resource_id: string, putCode: string): void {
	// 	if (this.hasResourcePutCode(resource_id)) {
	// 		this.getResourcePutCode(resource_id).putCode = putCode;
	// 	} else {
	// 		this.orcid_work_put_codes.push({
	// 			resource_id,
	// 			putCode,
	// 		});
	// 	}
	// }
}

export const UserSchema = SchemaFactory.createForClass(User);

export function userCollectionSchemaFactory() {
	const UserCollectionSchema =
		SchemaFactory.createForClass(User).loadClass(User);

	UserCollectionSchema.index(
		{ orcid_id: 1 },
		{ unique: true, name: 'unique_users' },
	);

	UserCollectionSchema.methods.hasResourcePutCode;

	return UserCollectionSchema;
}
