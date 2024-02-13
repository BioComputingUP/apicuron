import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AchievementType, PrivacyType } from '../../enums';
import { ResourceEntity } from '../components/resource-entity.schema';

export type AchievementDefDocument = HydratedDocument<AchievementDef>;

@Schema({
	collection: 'achievements_def',
	discriminatorKey: 'type',
})
export class AchievementDef extends ResourceEntity {
	@Prop()
	id: string;

	@Prop()
	category: string;

	@Prop()
	color: string;

	@Prop()
	count_threshold: number;

	@Prop({ required: true })
	name: string;

	@Prop()
	resource_uri: string;

	@Prop({
		type: [String],
		required: true,
	})
	list_terms: string[];

	// Added to define the discriminatory field
	@Prop({
		type: String,
		required: true,
		enum: [AchievementType.badge, AchievementType.medal],
	})
	type: string;

	// badge field
	@Prop({
		type: String,
		required() {
			return this.type == AchievementType.badge;
		},
	})
	color_code?: string;

	// medal fields
	@Prop({
		type: Number,
		required() {
			return this.type == AchievementType.medal;
		},
	})
	score_relative?: number;

	@Prop({
		required: false,
	})
	first_day?: Date;

	@Prop({
		required: false,
	})
	last_day?: Date;
}

export const AchievementDefSchema =
	SchemaFactory.createForClass(AchievementDef);
