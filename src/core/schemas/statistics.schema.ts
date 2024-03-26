import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schema';
import { StatisticsTerms } from './statistics-terms.schema';
import { HydratedDocument } from 'mongoose';
import {
	ReportsMeta,
	ReportMetaSchema,
	AggregatedReportsSchemaFactory as UserResourceEntitySchemaFactory,
} from './components/aggregated-data.schema';
import { UserResourceEntity } from './components/user-resource-entity.schema';
import { mapValues } from 'lodash';
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

	@Prop({ required: true, type: String })
	resource_id: string;

	@Prop({ required: true, type: String, enum: PrivacyType })
	privacy: PrivacyType;

	@Prop({ required: true })
	league: string;
}

export const StatisticsSchema =
	SchemaFactory.createForClass(Statistics).loadClass(Statistics);

// export function StatisticsSchemaFactory() {

// 	StatisticsSchema.virtual('user', {
// 		ref: User.name,
// 		localField: 'curator_orcid',
// 		foreignField: 'orcid_id',
// 		justOne: true,
// 	});

// 	// creating indexes
// 	StatisticsSchema.index({ resource_id: 1 }, { name: 'resource_id_index ' });
// 	StatisticsSchema.index(
// 		{ curator_orcid: 1 },
// 		{ name: 'curator_orcid_index ' },
// 	);

// 	// creating unique index, using fields from ActivityClass
// 	StatisticsSchema.index(
// 		{ resource_id: 1, curator_orcid: 1, privacy: 1, league: 1 },
// 		{ name: 'unique_index', unique: true },
// 	);
// 	return StatisticsSchema;
// }
