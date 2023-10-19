import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schema';
import { StatisticsTerms } from './statistics-terms.schema';

export type StatisticsDocument = Statistics & Document;
@Schema({
	collection: 'statistics',
	discriminatorKey: 'privacy',
})
export class Statistics {
	@Prop({ required: true, default: () => 0 })
	badges_count: number;

	@Prop({ required: true })
	curator_orcid: string;

	@Prop({ required: true, type: 'Number', default: () => 0 })
	generation_count: number;

	@Prop({ required: true, default: () => 0 })
	generation_score: number;

	@Prop({ required: true })
	generation_terms: StatisticsTerms[];
	/// Multiple data types found: Float: 28.1%, Int: 71.9% out of 89 sampled entries
	@Prop({ required: true, default: () => 0 })
	invalidation_count: number;

	/// Multiple data types found: Float: 28.1%, Int: 71.9% out of 89 sampled entries
	@Prop({ required: true, default: () => 0 })
	invalidation_score: number;

	@Prop({ required: true })
	invalidation_terms: StatisticsTerms[];

	@Prop({ required: true, default: () => 0 })
	medals_count: number;

	@Prop({ required: true, default: () => 0 })
	ranking: number;

	@Prop({ required: false })
	resource_uri: string;

	@Prop({ required: true })
	resource_id: string;

	/// Multiple data types found: Float: 15.7%, Int: 84.3% out of 89 sampled entries
	@Prop({ required: true, default: () => 0 })
	revision_count: number;

	/// Multiple data types found: Float: 15.7%, Int: 84.3% out of 89 sampled entries
	@Prop({ required: true, default: () => 0 })
	revision_score: number;

	@Prop({ required: true })
	revision_terms: StatisticsTerms[];

	@Prop({ required: false, default: () => 0 })
	total_count: number;

	@Prop({ required: true, default: () => 0 })
	total_score: number;
	@Prop({ required: true, default: 'private' })
	privacy?: 'private' | 'public' = 'private';

	@Prop({ required: true, default: 'contribution' })
	type?: 'contribution' | 'paid' = 'contribution';
}

const StatisticsSchema = SchemaFactory.createForClass(Statistics);

StatisticsSchema.virtual('user', {
	ref: User.name,
	localField: 'curator_orcid',
	foreignField: 'orcid_id',
	justOne: true,
});

// Public Statistics !
export type PublicStatisticsDocument = PublicStatistics & Document;
@Schema({
	collection: 'statistics',
})
export class PublicStatistics {
	badges_count: number;
	curator_orcid: string;
	generation_count: number;
	generation_score: number;
	generation_terms: StatisticsTerms[];
	invalidation_count: number;
	invalidation_score: number;
	invalidation_terms: StatisticsTerms[];
	medals_count: number;
	ranking: number;
	resource_uri: string;
	resource_id: string;
	revision_count: number;
	revision_score: number;
	revision_terms: StatisticsTerms[];
	total_count: number;
	total_score: number;
	type?: 'contribution' | 'paid' = 'contribution';
}

const PublicStatisticsSchema = SchemaFactory.createForClass(PublicStatistics);

// Private Statistics !
export type PrivateStatisticsDocument = PrivateStatistics & Document;
@Schema({
	collection: 'statistics',
})
export class PrivateStatistics {
	badges_count: number;
	curator_orcid: string;
	generation_count: number;
	generation_score: number;
	generation_terms: StatisticsTerms[];
	invalidation_count: number;
	invalidation_score: number;
	invalidation_terms: StatisticsTerms[];
	medals_count: number;
	ranking: number;
	resource_uri: string;
	resource_id: string;
	revision_count: number;
	revision_score: number;
	revision_terms: StatisticsTerms[];
	total_count: number;
	total_score: number;
	type?: 'contribution' | 'paid' = 'contribution';
}

const PrivateStatisticsSchema = SchemaFactory.createForClass(PrivateStatistics);

export { StatisticsSchema, PublicStatisticsSchema, PrivateStatisticsSchema };
