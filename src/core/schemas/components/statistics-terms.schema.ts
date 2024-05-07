import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, LeanDocument } from 'mongoose';

export type ActivitiesStatisticsDocument =
	HydratedDocument<ActivitiesStatistics>;
export type LeanActivitiesStatisticsDocument =
	LeanDocument<ActivitiesStatisticsDocument>;

@Schema({
	autoCreate: false,
})
export class ActivitiesStatistics {
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
	description: string;
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

	@Prop({
		type: Number,
		required: true,
		default: () => 0,
	})
	total_score: number;

	@Prop({
		type: Date,
		required: true,
	})
	last_contribution: Date;

	@Prop({
		type: Date,
		required: true,
	})
	first_contribution: Date;
}

export const ActivitiesStatisticsSchema =
	SchemaFactory.createForClass(ActivitiesStatistics).loadClass(
		ActivitiesStatistics,
	);
