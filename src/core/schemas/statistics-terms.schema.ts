import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

export type StatisticsTermsDocument = StatisticsTerms & Document;

@Schema({
	autoCreate: false,
})
export class StatisticsTerms {
	@Prop({
		type: String,
		required: true,
		enum: ['generation', 'invalidation', 'revision'],
	})
	activity_category: string;

	@Prop({
		type: String,
		required: true,
	})
	activity_name: string;
	@Prop({
		type: String,
		required: true,
	})
	activity_term: string;
	@Prop({
		type: Number,
		required: true,
		default: () => 0,
	})
	count: number;

	@Prop({
		type: String,
		required: true,
	})
	curator_orcid: string;
	@Prop({
		type: String,
		required: true,
	})
	description: string;
	@Prop({
		type: String,
		required: true,
	})
	resource_uri: string;
	@Prop({
		type: Number,
		required: true,
		default: () => 0,
	})
	score: number;
	@Prop({
		type: Number,
		required: true,
		default: () => 0,
	})
	sum: number;
}

export const StatisticsTermsSchema =
	SchemaFactory.createForClass(StatisticsTerms);
