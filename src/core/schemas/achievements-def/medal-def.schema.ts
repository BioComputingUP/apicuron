import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PrivacyType } from '../../enums';

export type MedalDefDocument = HydratedDocument<MedalDef>;

@Schema({
	collection: 'achievements_def',
})
/**
 * Represents a medal definition.
 */
export class MedalDef {
	/**
	 * The ID of the medal.
	 */
	@Prop()
	id: string;

	/**
	 * The category of the medal.
	 */
	@Prop()
	category: string;

	/**
	 * The color of the medal.
	 */
	@Prop()
	color: string;

	/**
	 * The name of the medal.
	 */
	@Prop({ required: true })
	name: string;

	/**
	 * The resource URI of the medal.
	 */
	@Prop()
	resource_uri: string;

	/**
	 * The resource ID of the medal.
	 */
	resource_id: string;

	/**
	 * The list of terms associated with the medal.
	 */
	@Prop({
		type: [String],
		required: true,
	})
	list_terms: string[];

	/**
	 * The relative score of the medal.
	 * Represents the number of people that can earn a specific medal defined by the resource
	 * e.g: if the score_relative is set to 10, 10 people at max will earn the medal.
	 */
	@Prop({
		type: Number,
		required: true,
	})
	score_relative?: number;

	/**
	 * The first day the medal is valid.
	 */
	@Prop({
		type: Date,
		required: false,
	})
	first_day?: Date;

	/**
	 * The last day the medal is valid.
	 */
	@Prop({
		type: Date,
		required: false,
	})
	last_day?: Date;

	/**
	 * The league associated with the medal.
	 */
	@Prop({
		required: true,
	})
	league: string;

	/**
	 * The privacy type of the medal.
	 */
	@Prop({
		required: true,
		type: String,
		enum: PrivacyType,
	})
	privacy: PrivacyType;
}

export const MedalDefSchema =
	SchemaFactory.createForClass(MedalDef).loadClass(MedalDef);
