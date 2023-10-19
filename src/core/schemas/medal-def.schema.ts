import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type MedalDefDocument = MedalDef & Document;

@Schema({
	collection: 'achievements_def',
})
export class MedalDef {
	@Prop()
	id: string;

	@Prop()
	category: string;

	@Prop()
	color: string;

	@Prop()
	count_threshold: number;

	@Prop({ required: true })
	name: string;

	@Prop()
	resource_uri: string;

	@Prop({
		type: [String],
		required: true,
	})
	resource_id: string;

	@Prop({
		type: [String],
		required: true,
	})
	list_terms: string[];

	// medal fields
	@Prop({
		type: Number,
		required: true,
	})
	score_relative?: number;

	@Prop({
		type: Date,
		required: false,
	})
	first_day?: Date;

	@Prop({
		type: Date,
		required: false,
	})
	last_day?: Date;
}

export const MedalDefSchema = SchemaFactory.createForClass(MedalDef);
