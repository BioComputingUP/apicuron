import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Badge } from './badges.schema';
import { Medal } from './medals.schema';
import { Term } from './terms.schema';

export type PartnerResourceDocument = PartnerResource & Document;

@Schema({ collection: 'resources_def' })
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
}

export class ResourceSummary extends PartnerResource {
	badges: Badge[];
	medals: Medal[];
	terms: Term[];
}

export const PartnerResourceSchema =
	SchemaFactory.createForClass(PartnerResource);
