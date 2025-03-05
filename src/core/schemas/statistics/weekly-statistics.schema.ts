import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PrivacyType } from '../../enums';
import { IUserResourceEntity } from '../../interfaces/user-resource-entity';
import { HydratedDocument, LeanDocument, Types } from 'mongoose';
import { LeagueSchema, League } from '../league/league.schema';
import {
	PartnerResourceSchema,
	PartnerResource,
} from '../resource/partner-resource.schema';
import { UserSchema, User } from '../user.schema';
type WeeklyStatisticsDocumentOverride = {
	user: (Types.Subdocument<Types.ObjectId> & User) | null;
	resource: Types.Subdocument<Types.ObjectId> & PartnerResource;
	league_data: Types.Subdocument<Types.ObjectId> & League;
}
export type WeeklyStatisticsDocument = HydratedDocument<WeeklyStatistics, WeeklyStatisticsDocumentOverride>;
export type LeanWeeklyStatisticsDocument =
	LeanDocument<WeeklyStatisticsDocument>;

@Schema({
	collection: 'weekly_statistics',
	timestamps: true,
})
export class WeeklyStatistics implements IUserResourceEntity {
	@Prop({ required: true, type: String })
	resource_id: string;

	@Prop({ required: false, type: UserSchema })
	user: (Types.Subdocument<Types.ObjectId> & User) | null;

	@Prop({ required: true, type: PartnerResourceSchema })
	resource: Types.Subdocument<Types.ObjectId> & PartnerResource;

	@Prop({ required: true, type: LeagueSchema })
	league_data: Types.Subdocument<Types.ObjectId> & League;

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

	@Prop({ required: true, type: Date })
	weekStart: Date;

	@Prop({ required: true, type: Date })
	weekEnd: Date;

	createdAt: Date;
	updatedAt: Date;
}

// const WeeklyStatisticsSchema =
// 	SchemaFactory.createForClass(WeeklyStatistics).loadClass(WeeklyStatistics);

export function WeeklyStatisticsSchemaFactory() {
	const WeeklyStatisticsSchema =
		SchemaFactory.createForClass(WeeklyStatistics).loadClass(WeeklyStatistics);

	WeeklyStatisticsSchema.index(
		{
			resource_id: -1,
			league: -1,
			curator_orcid: -1,
			weekStart: -1,
			weekEnd: -1,
		},
		{
			unique: true,
			name: 'unique_index',
			comment:
				'Uniquely indexes the WeeklyStatistic by resource_id, league, and curator_orcid',
		},
	);

	return WeeklyStatisticsSchema;
}
