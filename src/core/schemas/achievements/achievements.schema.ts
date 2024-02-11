import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AchievementType } from '../../enums';

export type AchievementDocument = HydratedDocument<Achievement>;

@Schema({ collection: 'achievements', discriminatorKey: 'type' })
export class Achievement {
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
	league: string;
}

export function AchievementsSchemaFactory() {
	const AchievementSchema = SchemaFactory.createForClass(Achievement);

	return AchievementSchema;
}

// @Schema({ collection: 'achievements', discriminatorKey: 'type' })
// export class EarnedAchievement extends Achievement {}

// export function EarnedAchievementsSchemaFactory() {
// 	const AchievementSchema = SchemaFactory.createForClass(EarnedAchievement);
// 	function setEarnedFilter(
// 		this: Query<Achievement, AchievementDocument>,
// 		next,
// 	) {
// 		const filter = this.getFilter();
// 		this.setQuery({
// 			...filter,
// 			earned: true,
// 		});

// 		next();
// 	}
// 	AchievementSchema.pre('find', setEarnedFilter);

// 	AchievementSchema.pre('findOne', setEarnedFilter);

// 	AchievementSchema.pre('aggregate', function (next) {
// 		this.pipeline().unshift({ $match: { earned: true } });
// 		next();
// 	});

// 	return AchievementSchema;
// }
