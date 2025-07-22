import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
	FilterQuery,
	HydratedDocument,
	Model,
	ProjectionType,
	QueryOptions,
} from 'mongoose';
import { PrivacyType } from '../../enums';

export type BadgeDefModel = Model<BadgeDef>;
export type BadgeDefDocument = HydratedDocument<BadgeDef>;
export type BadgeDefFilter = FilterQuery<BadgeDef>;
export type BadgeDefProjection = ProjectionType<BadgeDef>;
export type BadgeDefQueryOptions = QueryOptions<BadgeDef>;

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

	@Prop({ required: true, type: String })
	resource_id: string;

	@Prop({
		type: [String],
		required: true,
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
}

export const BadgeDefSchema =
	SchemaFactory.createForClass(BadgeDef).loadClass(BadgeDef);
