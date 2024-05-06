import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import {
	StatisticsTerms,
	StatisticsTermsSchema,
} from './components/statistics-terms.schema';
import { HydratedDocument } from 'mongoose';
import { UserResourceEntity } from './components/user-resource-entity.schema';
import { PrivacyType } from '../enums';

export type StatisticsDocument = HydratedDocument<
	Statistics & UserResourceEntity
>;
@Schema({
	collection: 'statistics',
})
export class Statistics extends UserResourceEntity {
	@Prop({ required: true, default: () => 0 })
	badges_count: number;

	@Prop({ required: true })
	curator_orcid: string;

	@Prop({ required: true, type: 'Number', default: () => 0 })
	generation_count: number;

	@Prop({ required: true, default: () => 0 })
	generation_score: number;

	@Prop({ required: true, default: () => [], type: [StatisticsTermsSchema] })
	generation_terms: StatisticsTerms[];
	/// Multiple data types found: Float: 28.1%, Int: 71.9% out of 89 sampled entries
	@Prop({ required: true, default: () => 0 })
	invalidation_count: number;

	/// Multiple data types found: Float: 28.1%, Int: 71.9% out of 89 sampled entries
	@Prop({ required: true, default: () => 0 })
	invalidation_score: number;

	@Prop({ required: true, default: () => [], type: [StatisticsTermsSchema] })
	invalidation_terms: StatisticsTerms[];

	@Prop({ required: true, default: () => 0 })
	medals_count: number;

	@Prop({ required: true, default: () => 0 })
	ranking: number;

	@Prop({ required: false })
	resource_uri: string;

	/// Multiple data types found: Float: 15.7%, Int: 84.3% out of 89 sampled entries
	@Prop({ required: true, default: () => 0 })
	revision_count: number;

	/// Multiple data types found: Float: 15.7%, Int: 84.3% out of 89 sampled entries
	@Prop({ required: true, default: () => 0 })
	revision_score: number;

	@Prop({ required: true, default: () => [], type: [StatisticsTermsSchema] })
	revision_terms: StatisticsTerms[];

	@Prop({ required: false, default: () => 0 })
	total_count: number;

	@Prop({ required: true, default: () => 0 })
	total_score: number;

	@Prop({ required: true, type: String })
	resource_id: string;

	@Prop({ required: true, type: String, enum: PrivacyType })
	privacy: PrivacyType;

	@Prop({ required: true })
	league: string;
}

export const StatisticsSchema =
	SchemaFactory.createForClass(Statistics).loadClass(Statistics);
