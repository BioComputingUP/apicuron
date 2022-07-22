import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Term } from 'src/partner-resources/schemas/terms.schema';

export type ReportDocument = Report & Document;
@Schema({
	collection: 'reports',
	
	// toJSON: { virtuals: true },
	// toObject: { virtuals: true },
})
export class Report {
	@Prop({
		required: true,
	})
	activity_term: MongooseSchema.Types.String;

	@Prop({ required: true })
	curator_orcid: string;

	@Prop({ required: true })
	entity_uri: string;

	@Prop({ required: true })
	resource_uri: string;

	@Prop({ required: true })
	timestamp: Date;
}

const ReportSchema = SchemaFactory.createForClass(Report);

// ReportSchema.virtual('term', {
// 	ref: 'Term',
// 	localField: 'activity_term',
// 	path: 'activity_term',
// 	foreignField: 'activity_term',
// 	justOne: true,
// });

export { ReportSchema };
