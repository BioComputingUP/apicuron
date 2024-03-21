import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AchievementState, PrivacyType } from '../../enums';
import { UserResourceEntity } from '../components/user-resource-entity.schema';

export type MedalDocument = HydratedDocument<Medal>;
@Schema({ collection: 'achievements', timestamps: true })
export class Medal extends UserResourceEntity {
	createdAt: Date;
	updatedAt: Date;

	@Prop({
		required: false,
	})
	color: string;

	@Prop({
		required: true,
	})
	resource_id: string;

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

	curator_orcid: string;

	@Prop({
		required: true,
	})
	name: string;

	@Prop({
		required: false,
	})
	resource_uri: string;

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

	@Prop({
		required: true,
		type: String,
	})
	league: string;

	@Prop({
		required: true,
		type: String,
	})
	privacy: PrivacyType;

	@Prop({
		required: true,
		type: String,
	})
	state: AchievementState;
}

export const MedalSchema = SchemaFactory.createForClass(Medal).loadClass(Medal);

export class EarnedMedal extends Medal {}
export const EarnedMedalSchema =
	SchemaFactory.createForClass(EarnedMedal).loadClass(EarnedMedal);
