import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AggregatedReportsMixin } from '../components/aggregated-data.schema';
import { HydratedDocument } from 'mongoose';

export type MedalDocument = HydratedDocument<Medal>;

class BaseMedal {
	@Prop({
		required: false,
	})
	color: string;

	@Prop({
		required: false,
	})
	count_relative_index: number;

	@Prop({
		required: false,
	})
	count_relative_valid: boolean;

	@Prop({
		required: false,
	})
	count_threshold_valid: boolean;

	@Prop({
		required: true,
	})
	count_total: number;

	@Prop({
		required: true,
	})
	curator_orcid: string;

	@Prop({
		required: true,
	})
	name: string;

	@Prop({
		required: true,
	})
	resource_uri: string;

	@Prop({
		required: true,
	})
	resource_id: string;

	@Prop({
		required: true,
	})
	score_relative: number;

	@Prop({
		required: true,
	})
	score_relative_index: number;

	@Prop({
		required: false,
	})
	score_relative_valid: boolean;

	@Prop({
		required: false,
	})
	score_threshold_valid: boolean;

	@Prop({
		required: true,
	})
	score_total: number;

	@Prop({
		required: false,
	})
	list_terms: string[];

	league: string;
}

@Schema({ collection: 'achievements' })
export class Medal extends AggregatedReportsMixin(BaseMedal) {}

export const MedalSchema = SchemaFactory.createForClass(Medal).loadClass(Medal);

export class EarnedMedal extends Medal {}
export const EarnedMedalSchema =
	SchemaFactory.createForClass(EarnedMedal).loadClass(EarnedMedal);
