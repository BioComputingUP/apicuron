import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type BadgeDefDocument = BadgeDef & Document;

@Schema()
export class BadgeDef {
	// fields from Achievement
	// id: string;

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

	@Prop()
	resource_id: string;

	@Prop()
	list_terms: string[];

	// Fields specific for Badge

	@Prop()
	color_code: string;
}

export const BadgeDefSchema = SchemaFactory.createForClass(BadgeDef);
