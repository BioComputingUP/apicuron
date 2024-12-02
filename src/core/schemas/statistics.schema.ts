import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PrivacyType } from '../enums';
import { IUserResourceEntity } from '../interfaces/user-resource-entity';
import { User, UserSchema } from './user.schema';
import {
	PartnerResource,
	PartnerResourceSchema,
} from './resource/partner-resource.schema';
import { League, LeagueSchema } from './league/league.schema';

export type StatisticsDocument = HydratedDocument<Statistics>;
@Schema({
	collection: 'statistics',
})
export class Statistics implements IUserResourceEntity {
	@Prop({ required: true, default: () => 0 })
	badges_count: number;

	@Prop({ required: true, type: UserSchema })
	user: User;

	@Prop({ required: true, type: PartnerResourceSchema })
	resource: PartnerResource;

	@Prop({ required: true, type: LeagueSchema })
	league_data: League;

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

	@Prop({ required: true, default: () => 0 })
	medals_count: number;

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

	@Prop({ required: true, type: String })
	resource_id: string;

	@Prop({ required: true, type: String, enum: PrivacyType })
	privacy: PrivacyType;

	@Prop({ required: true })
	league: string;

	@Prop({ required: true, type: Date })
	last_contribution: Date;

	@Prop({ required: true, type: Date })
	first_contribution: Date;

	@Prop({ required: true, default: 0 })
	week_count: number;

	@Prop({ required: true, default: 0 })
	month_count: number;

	@Prop({ required: true, default: 0 })
	quarter_count: number;
}

export function StatisticsSchemaFactory() {
	const StatisticsSchema =
		SchemaFactory.createForClass(Statistics).loadClass(Statistics);

	StatisticsSchema.index(
		{
			resource_id: 1,
			league: 1,
			curator_orcid: 1,
		},
		{
			name: 'unique_index',
			unique: true,
			comment:
				'Uniquely indexes the statistic by resource_id, league and curator_orcid',
		},
	);

	return StatisticsSchema;
}
