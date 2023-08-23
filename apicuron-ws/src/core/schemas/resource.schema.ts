import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AchievementDef } from './achievement-def.schema';
import { Term } from './terms.schema';

export type PartnerResourceDocument = HydratedDocument<PartnerResource>;


// this class defines a partnerResource that has been validated and has the ability to have Models, Badges and so on
@Schema()
export class PartnerResource {
	// @Prop({ required: true, unique: true })
	// id: string;

	@Prop()
	resource_description: string;

	@Prop({ required: true, unique: true })
	resource_id: string;

	@Prop()
	resource_long_name: string;

	@Prop({ required: true, unique: true })
	resource_name: string;

	@Prop({ required: true, unique: true })
	resource_uri: string;

	@Prop({ required: true, unique: true })
	resource_url: string;

	@Prop({ required: false })
	logo: string;

	@Prop()
	color: string


	state: string;
}


export class ResourceSummary extends PartnerResource {
	badges: AchievementDef[];
	medals: AchievementDef[];
	terms: Term[];
}

export const PartnerResourceSchema =
	SchemaFactory.createForClass(PartnerResource);



export type SubmittedResourceDocument = HydratedDocument<SubmittedResource>;

// this class defines a partnerSubmittedResource that has been validated and has the ability to have Models, Badges and so on
@Schema({})
export class SubmittedResource {
	// @Prop({ required: true, unique: true })
	// id: string;

	@Prop()
	resource_description: string;

	@Prop({ required: true })
	resource_id: string;

	@Prop()
	resource_long_name: string;

	@Prop({ required: true, unique: true })
	resource_name: string;

	@Prop({ required: true, unique: true })
	resource_uri: string;

	@Prop({ required: true, unique: true })
	resource_url: string;

	@Prop({ type: Date, required: true, default: Date.now() })
	created_at: Date;

	@Prop({ type: String, required: true })
	logo: string;

	@Prop({ type: String, required: true })
	color: string;

	@Prop({ type: String })
	creator: string;

	state: string;
}


export const SubmittedResourceSchema = SchemaFactory.createForClass(SubmittedResource);

export type ResourceDocument = HydratedDocument<Resource>;

// this class defines a partnerResource that has been validated and has the ability to have Models, Badges and so on
@Schema({
	collection: 'resources_def', discriminatorKey: 'state',
	virtuals: true
})
export class Resource {
	// @Prop({ required: true, unique: true })
	// id: string;

	@Prop()
	resource_description: string;

	@Prop({ required: true, unique: true })
	resource_id: string;

	@Prop()
	resource_long_name: string;

	@Prop({ required: true, unique: true })
	resource_name: string;

	@Prop({ required: true, unique: true })
	resource_uri: string;

	@Prop({ required: true, unique: true })
	resource_url: string;

	@Prop()
	logo: string;

	@Prop({
		type: String,
		required: true,
		default: SubmittedResource.name,
		enum: [SubmittedResource.name, PartnerResource.name]
	})
	state: string;

	// @Prop({
	// 	type: [Types.ObjectId],
	// 	ref: Term.name,
	// 	default: () => []
	// })
	// terms: Term[]
}


export const ResourceSchema = SchemaFactory.createForClass(Resource);

ResourceSchema.virtual('terms', {
	ref: Term.name,
	localField: 'resource_id',
	foreignField: 'resource_id',
})

ResourceSchema.virtual('badges', {
	ref: AchievementDef.name,
	localField: 'resource_id',
	foreignField: 'resource_id',
	match: { type: 'badge' }
})

ResourceSchema.virtual('medals', {
	ref: AchievementDef.name,
	localField: 'resource_id',
	foreignField: 'resource_id',
	match: { type: 'medal' }
})
// export { ResourceSchema }
// function get_valid_resources_only(next) {
// 	this.where('valid').equals(true);
// }

