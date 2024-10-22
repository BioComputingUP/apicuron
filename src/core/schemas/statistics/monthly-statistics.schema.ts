import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IUserResourceEntity } from '../../interfaces/user-resource-entity';
import { PrivacyType } from '../../enums';
import { HydratedDocument, LeanDocument } from 'mongoose';

export type MonthlyStatisticsDocument = HydratedDocument<MonthlyStatistics>;
export type LeanMonthlyStatisticsDocument =
	LeanDocument<MonthlyStatisticsDocument>;

@Schema({
	collection: 'monthly_statistics',
	timestamps: true,
})
export class MonthlyStatistics implements IUserResourceEntity {
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

	@Prop({ required: true, default: () => 0 })
	invalidation_count: number;

	@Prop({ required: true, default: () => 0 })
	invalidation_score: number;

	@Prop({ required: false })
	resource_uri: string;

	@Prop({ required: true, default: () => 0 })
	revision_count: number;

	@Prop({ required: true, default: () => 0 })
	revision_score: number;

	@Prop({ required: false, default: () => 0 })
	total_count: number;

	@Prop({ required: true, default: () => 0 })
	total_score: number;

	@Prop({ required: true, type: Date })
	last_contribution: Date;

	@Prop({ required: true, type: Date })
	first_contribution: Date;

	@Prop({ required: true, type: Date })
	monthStart: Date;

	@Prop({ required: true, type: Date })
	monthEnd: Date;

	createdAt: Date;
	updatedAt: Date;
}

export function MonthlyStatisticsSchemaFactory() {
	const WeeklyStatisticsSchema =
		SchemaFactory.createForClass(MonthlyStatistics).loadClass(
			MonthlyStatistics,
		);

	WeeklyStatisticsSchema.index(
		{
			resource_id: -1,
			league: -1,
			curator_orcid: -1,
			monthStart: -1,
			monthEnd: -1,
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
