import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type MedalDocument = Medal & Document;

@Schema({ collection: 'achievements_def' })
export class Medal {
	// fields from Achievement
	@Prop({
		required: false,
	})
	category: string;
	@Prop({
		required: false,
	})
	color: string;

	@Prop({
		required: false,
	})
	count_relative_index: number;

	@Prop({
		required: false,
	})
	count_relative_valid: Boolean;

	@Prop({
		required: false,
	})
	count_threshold_valid: Boolean;

	@Prop({
		required: true,
	})
	count_total: number;

	@Prop({
		required: true,
	})
	curator_orcid: string;

	@Prop({
		required: true,
	})
	name: string;

	@Prop({
		required: true,
	})
	resource_uri: string;

	@Prop({
		required: true,
	})
	resource_id: string;

	@Prop({
		required: true,
	})
	score_relative: number;

	@Prop({
		required: true,
	})
	score_relative_index: number;

	@Prop({
		required: false,
	})
	score_relative_valid: Boolean;

	@Prop({
		required: false,
	})
	score_threshold_valid: Boolean;

	@Prop({
		required: true,
	})
	score_total: number;

	@Prop()
	list_terms: string[]
}

export const MedalSchema = SchemaFactory.createForClass(Medal);
