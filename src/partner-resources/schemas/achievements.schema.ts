import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type AchievementDocument = Achievement & Document;


@Schema({ collection: 'achievements_def', discriminatorKey: 'type' })
export class Achievement {
	id: string;
	category: string;
	color: string;
	count_threshold: number;
	
	name: string;
	resource_uri: string;
	list_terms: string[];
	
	// Added to define the discriminatory field
	@Prop({
		type: String,
		required: true,
		enum: ['badge', 'medal']
	})
	type: string;
}

export const AchievementSchema = SchemaFactory.createForClass(Achievement);



