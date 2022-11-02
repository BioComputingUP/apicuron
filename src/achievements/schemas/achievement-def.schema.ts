import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { PartnerResourcesService } from "../../resources/partner-resources/partner-resources.service";

export type AchievementDefDocument = AchievementDef & Document;


@Schema({
	collection: 'achievements_def', discriminatorKey: 'type'
})
export class AchievementDef {
	@Prop()
	id: string;

	@Prop()
	category: string;

	@Prop()
	color: string;

	@Prop()
	count_threshold: number;

	@Prop()
	name: string;

	@Prop()
	resource_uri: string;


	@Prop({
		type: Array<String>,
		required: true
	})
	resource_id: string;

	@Prop({
		type: Array<String>,
		required: true
	})
	list_terms: string[];

	// Added to define the discriminatory field
	@Prop({
		type: String,
		required: true,
		enum: ['badge', 'medal']
	})
	type: string;

	// badge field
	@Prop({
		type: String,
		required() {
			return this.type == 'badge'
		}
	})
	color_code?: string;


	// medal fields
	@Prop({
		type: Number,
		required() {
			return this.type == 'medal'
		}
	})
	score_relative?: number;

	@Prop({
		required: false
	})
	first_day?: Date;

	@Prop({
		required: false,
	})
	last_day?: Date;
}

export const AchievementDefSchema = SchemaFactory.createForClass(AchievementDef);



