import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type BadgeDocument = Badge & Document;

@Schema({
	collection: 'achievements',
})
export class Badge {
	// fields from Achievement
	// id: string;
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
	count: number;
	@Prop({
		required: true,
	})
	color_code: string;
	@Prop({
		required: true,
	})
	count_threshold: number;

	@Prop()
	list_terms: string[];

	@Prop({
		type: Date,
	})
	earned_at: Date;

	@Prop({
		type: Boolean,
	})
	earned: boolean;
}

export const BadgeSchema = SchemaFactory.createForClass(Badge);

export class EarnedBadge extends Badge {}
export const EarnedBadgeSchema = SchemaFactory.createForClass(EarnedBadge);
