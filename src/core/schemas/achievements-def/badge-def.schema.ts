import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PrivacyType } from '../../enums';

export type BadgeDefDocument = HydratedDocument<BadgeDef>;

@Schema({
	collection: 'achievements_def',
})
export class BadgeDef {
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

	@Prop({ required: true })
	displayedName: string;

	@Prop()
	resource_uri: string;

	resource_id: string;

	@Prop({
		type: [String],
		required: function () {
			return !this.assignable;
		},
	})
	list_terms: string[];

	// badge field
	@Prop({
		type: String,
	})
	color_code: string;

	// date bounds
	@Prop({ required: false })
	startDate?: Date;

	@Prop({ required: false })
	endDate?: Date;

	league: string;
	privacy: PrivacyType;

	@Prop({
		type: Boolean,
		required: false,
		default: false,
	})
	assignable?: boolean; // whether the badge can be manually assigned or  not

	@Prop({
		type: [String],
		required: false,
		default: () => [],
	})
	assigned_to: string[];
}

export const BadgeDefSchema =
	SchemaFactory.createForClass(BadgeDef).loadClass(BadgeDef);
