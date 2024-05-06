import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
	StatisticsTerms,
	StatisticsTermsSchema,
} from './statistics-terms.schema';

@Schema({
	autoCreate: false,
	timestamps: true,
})
export class StatisticsDetails {
	@Prop({
		type: [StatisticsTermsSchema],
		required: true,
		default: () => [],
	})
	generation: StatisticsTerms[];

	@Prop({
		type: [StatisticsTermsSchema],
		required: true,
		default: () => [],
	})
	invalidation: StatisticsTerms[];

	@Prop({
		type: [StatisticsTermsSchema],
		required: true,
		default: () => [],
	})
	revision: StatisticsTerms[];
}

export const StatisticsDetailsSchema =
	SchemaFactory.createForClass(StatisticsDetails).loadClass(StatisticsDetails);
