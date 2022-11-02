import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { FilterQuery, ProjectionType, QueryOptions } from 'mongoose';
import { AchievementDef } from '../../achievements/schemas/achievement-def.schema';
import { BadgeDef } from '../../achievements/schemas/badges_def.schema';
import { MedalDef } from '../../achievements/schemas/medals_def.schema';
// import { BadgeDef } from './badges.schema';
// import { MedalDef } from './medals.schema';
import { Term } from './terms.schema';

export type PartnerResourceDocument = PartnerResource & Document;

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

	// @Prop({
	// 	type: String,
	// 	required: false,
	// 	default: 'valid',
	// 	enum: ['validated']
	// })
	// state= 'valid';
}


export class ResourceSummary extends PartnerResource {
	badges: AchievementDef[];
	medals: AchievementDef[];
	terms: Term[];
}

export const PartnerResourceSchema =
	SchemaFactory.createForClass(PartnerResource);


// function get_valid_resources_only(next) {
// 	this.where('valid').equals(true);
// }

// PartnerResourceSchema.pre('find', get_valid_resources_only);
