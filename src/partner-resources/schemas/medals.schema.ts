import { Schema, SchemaFactory } from '@nestjs/mongoose';

export type MedalDocument = Medal & Document;

@Schema({ collection: 'achievements_def' })
export class Medal {
	// fields from Achievement
	id: string;
	category: string;
	color: string;
	count_threshold: number;

	name: string;
	resource_uri: string;
	list_terms: string[];

	type: string;

	// Fields specific to Medal

	score_relative: string[];
	first_day: Date;
	last_day: Date;
}

export const MedalSchema = SchemaFactory.createForClass(Medal);
