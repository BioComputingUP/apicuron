import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PrivacyType } from '../../enums';
import { IUserResourceEntity } from '../../interfaces/user-resource-entity';
import { HydratedDocument, LeanDocument } from 'mongoose';

export type WeeklyStatisticsDocument = HydratedDocument<WeeklyStatistics>;
export type LeanWeeklyStatisticsDocument =
	LeanDocument<WeeklyStatisticsDocument>;

@Schema({
	collection: 'weekly_statistics',
	timestamps: true,
})
export class WeeklyStatistics implements IUserResourceEntity {
	@Prop({ required: true, type: String })
	resource_id: string;

	@Prop({ required: true, type: String, enum: PrivacyType })
	privacy: PrivacyType;

	@Prop({ required: true })
	league: string;

	@Prop({ required: true })
	curator_orcid: string;

	@Prop({ required: true, type: 'Number', default: () => 0 })
	generation_count: number;

	@Prop({ required: true, default: () => 0 })
	generation_score: number;

	// @Prop({ required: true, default: () => [], type: [StatisticsTermsSchema] })
	// generation_terms: StatisticsTerms[];
	/// Multiple data types found: Float: 28.1%, Int: 71.9% out of 89 sampled entries
	@Prop({ required: true, default: () => 0 })
	invalidation_count: number;

	/// Multiple data types found: Float: 28.1%, Int: 71.9% out of 89 sampled entries
	@Prop({ required: true, default: () => 0 })
	invalidation_score: number;

	// @Prop({ required: true, default: () => [], type: [StatisticsTermsSchema] })
	// invalidation_terms: StatisticsTerms[];

	@Prop({ required: false })
	resource_uri: string;

	/// Multiple data types found: Float: 15.7%, Int: 84.3% out of 89 sampled entries
	@Prop({ required: true, default: () => 0 })
	revision_count: number;

	/// Multiple data types found: Float: 15.7%, Int: 84.3% out of 89 sampled entries
	@Prop({ required: true, default: () => 0 })
	revision_score: number;

	// @Prop({ required: true, default: () => [], type: [StatisticsTermsSchema] })
	// revision_terms: StatisticsTerms[];

	@Prop({ required: false, default: () => 0 })
	total_count: number;

	@Prop({ required: true, default: () => 0 })
	total_score: number;

	@Prop({ required: true, type: Date })
	last_contribution: Date;

	@Prop({ required: true, type: Date })
	first_contribution: Date;

	@Prop({ required: true, default: () => Array(7).fill(0) })
	daysOfWeek: number[];

	createdAt: Date;
	updatedAt: Date;
}

export const WeeklyStatisticsSchema =
	SchemaFactory.createForClass(WeeklyStatistics).loadClass(WeeklyStatistics);
