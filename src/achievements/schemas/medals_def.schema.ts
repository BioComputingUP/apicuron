import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type MedalDefDocument = MedalDef & Document;

@Schema()
export class MedalDef {
	// fields from Achievement

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

	@Prop()
	resource_id: string;

	@Prop()
	list_terms: string[];

	// Fields specific to Medal

	@Prop()
	score_relative: number;

	@Prop()
	first_day: Date;
	
	@Prop()
	last_day: Date;

}

export const MedalDefSchema = SchemaFactory.createForClass(MedalDef);
