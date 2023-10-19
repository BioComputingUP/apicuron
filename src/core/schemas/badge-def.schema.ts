import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type BadgeDefDocument = BadgeDef & Document;

@Schema({
	collection: 'achievements_def',
})
export class BadgeDef {
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

	// badge field
	@Prop({
		type: String,
		required: true,
	})
	color_code: string;
}

export const BadgeDefSchema = SchemaFactory.createForClass(BadgeDef);
