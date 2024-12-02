import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IUserResourceEntity } from '../../interfaces/user-resource-entity';
import { PrivacyType } from '../../enums';
import {
	ActivitiesStatistics,
	ActivitiesStatisticsSchema,
} from '../components/statistics-terms.schema';
import { HydratedDocument, LeanDocument } from 'mongoose';
import { User, UserDocument, UserSchema } from '../user.schema';
import { ResourceSchema } from '../resource/resource.schema';
import {
	PartnerResource,
	PartnerResourceSchema,
} from '../resource/partner-resource.schema';
import { League, LeagueSchema } from '../league/league.schema';

export type DetailedStatisticsDocument = HydratedDocument<DetailedStatistics>;
export type LeanDetailedStatisticsDocument =
	LeanDocument<DetailedStatisticsDocument>;

@Schema({
	collection: 'detailed_statistics',
	timestamps: true,
})
export class DetailedStatistics implements IUserResourceEntity {
	@Prop({ required: true, type: String })
	curator_orcid: string;

	@Prop({ required: true, type: UserSchema })
	user: User;

	@Prop({ required: true, type: PartnerResourceSchema })
	resource: PartnerResource;

	@Prop({ required: true, type: LeagueSchema })
	league_data: League;

	@Prop({ required: true, type: String })
	resource_id: string;

	@Prop({ required: true, type: String, enum: PrivacyType })
	privacy: PrivacyType;

	@Prop({ required: true })
	league: string;

	@Prop({ required: true, default: () => 0 })
	total_count: number;

	@Prop({ required: true, default: () => 0 })
	total_score: number;

	@Prop({ required: true, type: Date })
	last_contribution: Date;

	@Prop({ required: true, type: Date })
	first_contribution: Date;

	@Prop({ required: true, type: [ActivitiesStatisticsSchema] })
	activities: ActivitiesStatistics[];

	@Prop({ required: true, default: () => 0 })
	last_week_count: number;

	@Prop({ required: true, default: () => 0 })
	last_month_count: number;

	@Prop({ required: true, default: () => 0 })
	last_quarter_count: number;

	createdAt: Date;
	updatedAt: Date;
}

// export const DetailedStatisticsSchema =
// 	SchemaFactory.createForClass(DetailedStatistics).loadClass(
// 		DetailedStatistics,
// 	);
export function DetailedStatisticsSchemaFactory() {
	const DetailedStatisticsSchema =
		SchemaFactory.createForClass(DetailedStatistics).loadClass(
			DetailedStatistics,
		);

	DetailedStatisticsSchema.index(
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

	return DetailedStatisticsSchema;
}
