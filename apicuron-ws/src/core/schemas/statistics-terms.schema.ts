import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

export type StatisticsTermsDocument = StatisticsTerms & Document;



@Schema({
    autoCreate: false
})
export class StatisticsTerms {
    @Prop({
		type: String,
		required: true,
		enum: ['generation', 'invalidation', 'revision']
	})
	activity_category: string;
	activity_name: string;
	activity_term: string;
	count: number;
	curator_orcid: string;
	description: string;
	resource_uri: string;
	score: number;
	sum: number;
}

export const StatisticsTermsSchema = SchemaFactory.createForClass(StatisticsTerms);

