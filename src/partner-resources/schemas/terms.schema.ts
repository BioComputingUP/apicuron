import { Schema, SchemaFactory } from '@nestjs/mongoose';

export type TermDocument = Term & Document;

@Schema({ collection: 'terms_def' })
export class Term {
	// fields from Achievement
	id: string;
	activity_category: string;
	activity_name: string;
	activity_term: string;
	description: string;
	resource_uri: string;
	score: number;
}

export const TermSchema = SchemaFactory.createForClass(Term);
