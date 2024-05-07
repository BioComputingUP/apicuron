import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IUserResourceEntity } from '../../interfaces/user-resource-entity';
import { PrivacyType } from '../../enums';
import {
	ActivitiesStatistics,
	ActivitiesStatisticsSchema,
} from '../components/statistics-terms.schema';
import { HydratedDocument, LeanDocument } from 'mongoose';

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

	@Prop({
		required: true,
		type: [Number],
		default: () => Array(7).fill(0),
	})
	daysOfWeek: number[];

	@Prop({
		required: true,
		type: [Number],
		default: () => Array(7).fill(0),
	})
	months: number[];

	createdAt: Date;
	updatedAt: Date;
}

export const DetailedStatisticsSchema =
	SchemaFactory.createForClass(DetailedStatistics).loadClass(
		DetailedStatistics,
	);
