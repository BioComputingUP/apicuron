import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReportDocument = Report & Document;
@Schema({ collection: 'reports' })
export class Report {
	@Prop({ required: true })
	activity_term: string;

	@Prop({ required: true })
	curator_orcid: string;

	@Prop({ required: true })
	entity_uri: string;

	@Prop({ required: true })
	resource_uri: string;

	@Prop({ required: true })
	timestamp: Date;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
