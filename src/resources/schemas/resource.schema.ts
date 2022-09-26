import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PartnerResource } from './partner-resources.schema';
import { SubmittedResource } from './submitted-resource.schema';

export type ResourceDocument = Resource & Document;

// this class defines a partnerResource that has been validated and has the ability to have Models, Badges and so on
@Schema({ collection: 'resources_def', discriminatorKey:'state' })
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
}


export const ResourceSchema =
	SchemaFactory.createForClass(Resource);


// function get_valid_resources_only(next) {
// 	this.where('valid').equals(true);
// }

// ResourceSchema.pre('find', get_valid_resources_only);
