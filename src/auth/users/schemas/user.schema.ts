import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

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
	biography: string;

	@Prop({
		select: false,
	})
	cookie_token: string;

	@Prop()
	displayedName: string;

	@Prop()
	email: string;

	/// Could not determine type the field only had null or empty values in the sample set.
	@Prop()
	employment: string;

	@Prop()
	family_name: string;

	@Prop()
	full_name: string;

	@Prop()
	given_name: string;

	@Prop()
	gmail: string;

	@Prop()
	institution: string;

	@Prop({ select: false })
	jwt_token: string;

	/// Could not determine type the field only had null or empty values in the sample set.
	@Prop()
	keywords: string;

	@Prop({
		default: Date.now(),
		type: Date
	})
	last_update: Date;

	@Prop({ required: false })
	profile_picture?: string;

	@Prop({ required: true })
	role: string;

	@Prop()
	username: string;

	@Prop({ required: true, unique: true })
	orcid_id: string;

	@Prop({
		select: false,
	})
	orcid_permission: string;

	@Prop({ required: false, select: true })
	resources: UserResource[];

	@Prop({ required: true, default() { return [] }})
	contributed_to: string[]

}

const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('statistics', {
	ref: 'Statistics',
	localField: 'orcid_id',
	foreignField: 'curator_orcid',
});

export { UserSchema };