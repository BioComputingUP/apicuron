import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AchievementDef } from '../achievements-def/achievement-def.schema';
import { Term } from '../terms.schema';
import { PartnerResource } from './partner-resource.schema';
import { SubmittedResource } from './submitted-resource.schema';

export type ResourceDocument = HydratedDocument<Resource>;

// this class defines a partnerResource that has been validated and has the ability to have Models, Badges and so on
@Schema({
	collection: 'resources_def',
	discriminatorKey: 'state',
	timestamps: true,
	virtuals: true,
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

	@Prop({ required: false, type: Date })
	joined_date?: Date;

	created_at: Date;
	updated_at: Date;

	@Prop({
		type: String,
		required: true,
		default: SubmittedResource.name,
		enum: [SubmittedResource.name, PartnerResource.name],
	})
	state: string;
}

const ResourceSchema = SchemaFactory.createForClass(Resource);

ResourceSchema.virtual('terms', {
	ref: Term.name,
	localField: 'resource_id',
	foreignField: 'resource_id',
});

ResourceSchema.virtual('badges', {
	ref: AchievementDef.name,
	localField: 'resource_id',
	foreignField: 'resource_id',
	match: { type: 'badge' },
});

ResourceSchema.virtual('medals', {
	ref: AchievementDef.name,
	localField: 'resource_id',
	foreignField: 'resource_id',
	match: { type: 'medal' },
});

export { ResourceSchema };
// function get_valid_resources_only(next) {
// 	this.where('valid').equals(true);
// }
