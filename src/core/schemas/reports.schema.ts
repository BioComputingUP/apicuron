import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ActivityCategory } from './activity-category.schema';

export type ReportDocument = Report & Document;

@Schema({
	collection: 'reports',
})
export class Report extends ActivityCategory {
	@Prop({
		required: true,
	})
	activity_term: string;

	@Prop({ required: true, type: String })
	curator_orcid: string;

	@Prop({ required: true })
	entity_uri: string;

	@Prop({ required: false })
	resource_uri?: string;

	@Prop({ required: true })
	resource_id: string;

	@Prop({
		required: true,
		type: Date,
	})
	timestamp: Date;
}

const ReportSchema = SchemaFactory.createForClass(Report);

export { ReportSchema };
