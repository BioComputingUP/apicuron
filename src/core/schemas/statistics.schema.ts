import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schema';
import { StatisticsTerms } from './statistics-terms.schema';
import { HydratedDocument } from 'mongoose';
import * as _ from 'lodash';
import {
	ReportsMeta,
	ReportMetaSchema,
	AggregatedReportsSchemaFactory,
} from './components/aggregated-data.schema';

export type StatisticsDocument = HydratedDocument<Statistics>;
@Schema({
	collection: 'statistics',
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

	@Prop({ required: true, default: () => [] })
	generation_terms: StatisticsTerms[];
	/// Multiple data types found: Float: 28.1%, Int: 71.9% out of 89 sampled entries
	@Prop({ required: true, default: () => 0 })
	invalidation_count: number;

	/// Multiple data types found: Float: 28.1%, Int: 71.9% out of 89 sampled entries
	@Prop({ required: true, default: () => 0 })
	invalidation_score: number;

	@Prop({ required: true, default: () => [] })
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

	@Prop({ required: true, default: () => [] })
	revision_terms: StatisticsTerms[];

	@Prop({ required: false, default: () => 0 })
	total_count: number;

	@Prop({ required: true, default: () => 0 })
	total_score: number;
}

export function StatisticsSchemaFactory() {
	const StatisticsSchema = SchemaFactory.createForClass(Statistics);

	StatisticsSchema.virtual('user', {
		ref: User.name,
		localField: 'curator_orcid',
		foreignField: 'orcid_id',
		justOne: true,
	});

	// creating indexes
	StatisticsSchema.index({ resource_id: 1 }, { name: 'resource_id_index ' });
	StatisticsSchema.index(
		{ curator_orcid: 1 },
		{ name: 'curator_orcid_index ' },
	);

	// creating unique index, using fields from ActivityClass
	const activityClassIndex = _.mapValues(ReportMetaSchema.paths, () => 1);
	StatisticsSchema.index(
		{ resource_id: 1, curator_orcid: 1, ...activityClassIndex },
		{ name: 'unique_index', unique: true },
	);
	return StatisticsSchema;
}

export function StatisticsAggregatedReportsFactory(
	aggregatedReports: Partial<ReportsMeta>,
) {
	const StatisticsSchema = SchemaFactory.createForClass(Statistics);

	return AggregatedReportsSchemaFactory(StatisticsSchema, aggregatedReports);
}
