import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PrivacyType } from '../enums';
import { IResourceEntity } from '../interfaces/user-resource-entity';

export type TermDocument = HydratedDocument<Term>;

@Schema({ collection: 'terms_def' })
export class Term implements IResourceEntity {
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

	@Prop({ required: true, type: String })
	resource_id: string;

	@Prop({ required: true, type: String })
	league: string;

	@Prop({ required: true, type: String })
	privacy: PrivacyType;

	@Prop({ required: true, type: Number })
	score: number;
}

export const TermSchema = SchemaFactory.createForClass(Term).loadClass(Term);
