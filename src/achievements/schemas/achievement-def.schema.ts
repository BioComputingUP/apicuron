import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type AchievementDocument = AchievementDef & Document;


@Schema({ collection: 'achievements_def', discriminatorKey: 'type' })
export class AchievementDef {
	id: string;
	category: string;
	color: string;
	count_threshold: number;
	
	name: string;
	resource_uri: string;

	resource_id: string;

	list_terms: string[];
	
	// Added to define the discriminatory field
	@Prop({
		type: String,
		required: true,
		enum: ['badge', 'medal']
	})
	type: string;

	// badge field
	@Prop()
	color_code?: string;


	// medal fields
	@Prop()
	score_relative?: number;

	@Prop()
	first_day?: Date;
	
	@Prop()
	last_day?: Date;
}

export const AchievementDefSchema = SchemaFactory.createForClass(AchievementDef);



