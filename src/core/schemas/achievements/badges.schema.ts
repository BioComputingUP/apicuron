import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, LeanDocument } from 'mongoose';
import { AchievementState, PrivacyType } from '../../enums';
import { IUserResourceEntity } from '../../interfaces/user-resource-entity';

export type BadgeDocument = HydratedDocument<Badge>;
export type LeanBadgeDocument = LeanDocument<BadgeDocument>;

@Schema({
	collection: 'achievements',
	timestamps: true,
})
export class Badge implements IUserResourceEntity {
	createdAt: Date;
	updatedAt: Date;

	curator_orcid: string;
	@Prop({
		required: true,
	})
	name: string;

	@Prop({
		required: true,
	})
	displayedName: string;

	@Prop({
		required: false,
	})
	resource_uri?: string;

	// fields from Badge
	@Prop({
		required: true,
	})
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

	@Prop({
		required: true,
	})
	state: AchievementState;

	@Prop({
		type: Date,
		required: false,
	})
	achieved_at?: Date;

	@Prop({
		required: true,
		default: 0,
	})
	progress_rate: number;

	@Prop({
		required: true,
	})
	league: string;

	@Prop({
		required: true,
		enum: PrivacyType,
	})
	privacy: PrivacyType;

	@Prop({
		required: false,
	})
	startDate?: Date;

	@Prop({
		required: false,
	})
	endDate?: Date;
}

export const BadgeSchema = SchemaFactory.createForClass(Badge).loadClass(Badge);

export class EarnedBadge extends Badge {}
export const EarnedBadgeSchema =
	SchemaFactory.createForClass(EarnedBadge).loadClass(EarnedBadge);
