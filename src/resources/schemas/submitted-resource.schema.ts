import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Term } from '../../terms/schemas/terms.schema';

export type SubmittedResourceDocument = SubmittedResource & Document;

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

	// state = 'invalid';
}

export const SubmittedResourceSchema =
	SchemaFactory.createForClass(SubmittedResource);

// function get_valid_resources_only(next) {
// 	this.where('valid').equals(true);
// }

// SubmittedResourceSchema.pre('find', get_valid_resources_only);
