import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type MedalDocument = Medal & Document;

@Schema({ collection: 'achievements_def' })
export class Medal {
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
	list_terms: string[];

	// Fields specific to Medal

	@Prop()
	score_relative: number;

	@Prop()
	first_day: Date;
	
	@Prop()
	last_day: Date;

}

export const MedalSchema = SchemaFactory.createForClass(Medal);
