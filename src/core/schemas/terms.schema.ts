import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ResourceEntity } from './components/resource-entity.schema';
import { PrivacyType } from '../enums';

export type TermDocument = HydratedDocument<Term>;

@Schema({ collection: 'terms_def' })
export class Term extends ResourceEntity {
	// fields from Achievement

	// https://mongoosejs.com/docs/schematypes.html#schematype-options
	// @Prop()
	// id: string;

	@Prop({ required: true, type: String })
	activity_category: string;

	@Prop({ required: true, type: String })
	activity_name: string;

	@Prop({ required: true, type: String })
	activity_term: string;

	@Prop({ required: true, type: String })
	description: string;

	@Prop({ required: false, type: String })
	resource_uri: string;

	resource_id: string;
	league: string;
	privacy: PrivacyType;

	@Prop({ required: true, type: String })
	score: number;
}

export const TermSchema = SchemaFactory.createForClass(Term).loadClass(Term);
