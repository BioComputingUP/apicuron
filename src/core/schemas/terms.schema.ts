import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type TermDocument = Term & Document;

@Schema({ collection: 'terms_def' })
export class Term {
	// fields from Achievement
	
	// https://mongoosejs.com/docs/schematypes.html#schematype-options
	// @Prop()
	// id: string;
	
	@Prop()
	activity_category: string;
	
	@Prop()
	activity_name: string;
	
	@Prop()
	activity_term: string;
	
	@Prop()
	description: string;
	
	@Prop()
	resource_uri: string;
	
	@Prop()
	resource_id: string;
	
	@Prop()
	score: number;
}

export const TermSchema = SchemaFactory.createForClass(Term);
