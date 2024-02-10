import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BadgeDocument = HydratedDocument<Badge>;

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

	isEarned(): boolean {
		return this.count >= this.count_threshold;
	}
}

export const BadgeSchema = SchemaFactory.createForClass(Badge).loadClass(Badge);

export class EarnedBadge extends Badge {}
export const EarnedBadgeSchema =
	SchemaFactory.createForClass(EarnedBadge).loadClass(EarnedBadge);
