import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AchievementState, PrivacyType } from '../../enums';
import { UserResourceEntity } from '../components/user-resource-entity.schema';

export type BadgeDocument = HydratedDocument<Badge>;

@Schema({
	collection: 'achievements',
})
export class Badge extends UserResourceEntity {
	// fields from Achievement
	// id: string;

	curator_orcid: string;
	@Prop({
		required: true,
	})
	name: string;
	@Prop({
		required: true,
	})
	resource_uri: string;

	resource_id: string;

	@Prop({
		required: true,
	})
	count: number;
	@Prop({
		required: true,
	})
	color_code: string;
	@Prop({
		required: true,
	})
	count_threshold: number;

	@Prop({
		required: true,
	})
	list_terms: string[];

	state: AchievementState;

	league: string;
	privacy: PrivacyType;
}

export const BadgeSchema = SchemaFactory.createForClass(Badge).loadClass(Badge);

export class EarnedBadge extends Badge {}
export const EarnedBadgeSchema =
	SchemaFactory.createForClass(EarnedBadge).loadClass(EarnedBadge);
