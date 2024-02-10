import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Query } from 'mongoose';
import { AchievementState, AchievementType } from '../enums';
import { AggregatedReportsMixin } from './components/aggregated-data.schema';

export type AchievementDocument = HydratedDocument<Achievement>;

class AchievementBase {
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
		type: String,
		required: true,
		enum: AchievementType,
	})
	type: string;

	@Prop({
		type: String,
		required: true,
	})
	earned: AchievementState;
}

@Schema({ collection: 'achievements', discriminatorKey: 'type' })
export class Achievement extends AggregatedReportsMixin(AchievementBase) {}

export function AchievementsSchemaFactory() {
	const AchievementSchema = SchemaFactory.createForClass(Achievement);

	return AchievementSchema;
}

@Schema({ collection: 'achievements', discriminatorKey: 'type' })
export class EarnedAchievement extends Achievement {}

export function EarnedAchievementsSchemaFactory() {
	const AchievementSchema = SchemaFactory.createForClass(EarnedAchievement);
	function setEarnedFilter(
		this: Query<Achievement, AchievementDocument>,
		next,
	) {
		const filter = this.getFilter();
		this.setQuery({
			...filter,
			earned: true,
		});

		next();
	}
	AchievementSchema.pre('find', setEarnedFilter);

	AchievementSchema.pre('findOne', setEarnedFilter);

	AchievementSchema.pre('aggregate', function (next) {
		this.pipeline().unshift({ $match: { earned: true } });
		next();
	});

	return AchievementSchema;
}
