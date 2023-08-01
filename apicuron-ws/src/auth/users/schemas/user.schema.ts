import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Report } from '../../../reports/reports.schema';
import { Term } from '../../../terms/schemas/terms.schema';
import { generateAvatar } from '../generate_avatar';

export type UserDocument = User & Document;
export interface UserResource {
	id: string;
	name: string;
	resource_id: string;
}

export interface UserStat {
	resource_uri: string;
	resource_id: string;
	generation_count: number;
	revision_count: number;
	invalidation_count: number;
	generation_score: number;
	revision_score: number;
	invalidation_score: number;
	total_score: number;
	ranking: number;
	badges_count: number;
	medals_count: number;
}

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
	@Prop()
	employment?: string;

	@Prop()
	family_name?: string;

	@Prop()
	full_name?: string;

	@Prop()
	given_name?: string;

	@Prop()
	gmail?: string;

	@Prop()
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
}

const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('statistics', {
	ref: 'Statistics',
	localField: 'orcid_id',
	foreignField: 'curator_orcid',
});

UserSchema.virtual('reports', {
	ref: Report.name,
	localField: 'orcid_id',
	foreignField: 'curator_orcid',
});
export { UserSchema };
