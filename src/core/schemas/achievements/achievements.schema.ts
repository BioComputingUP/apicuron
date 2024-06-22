import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AchievementState, AchievementType, PrivacyType } from '../../enums';
import { IResourceEntity } from '../../interfaces/user-resource-entity';

export type AchievementDocument = HydratedDocument<Achievement>;

@Schema({
	collection: 'achievements',
	timestamps: true,
	discriminatorKey: 'type',
})
export class Achievement implements IResourceEntity {
	@Prop({ required: true, type: String, enum: PrivacyType })
	privacy: PrivacyType;

	@Prop({ required: true, type: String })
	curator_orcid: string;

	createdAt: Date;
	updatedAt: Date;

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
		required: true,
	})
	resource_id: string;

	@Prop({
		type: String,
		required: true,
		enum: AchievementState,
	})
	state: AchievementState;

	@Prop({ required: true, type: String })
	league: string;
}

export function AchievementsSchemaFactory() {
	const AchievementSchema =
		SchemaFactory.createForClass(Achievement).loadClass(Achievement);

	AchievementSchema.index(
		{
			resource_id: 1,
			league: 1,
			type: 1,
			name: 1,
			curator_orcid: 1,
		},
		{
			name: 'unique_index',
			unique: true,
			comment:
				'Uniquely indexes the achievement by resource_id, league, type, name, and curator_orcid',
		},
	);

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
