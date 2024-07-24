import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PrivacyType } from '../../enums';

export type LeagueDocument = HydratedDocument<League>;

@Schema({
	_id: false,
	timestamps: true,
})
export class League {
	@Prop({
		required: true,
		type: String,
	})
	name: string;

	@Prop({
		required: true,
		type: [String],
		default: () => [],
	})
	defaultMembers: string[];

	@Prop({
		required: true,
		type: String,
	})
	displayedName: string;

	@Prop({
		required: true,
		type: String,
		defualt: () => PrivacyType.public,
	})
	visibility: PrivacyType;
}

export const LeagueSchema =
	SchemaFactory.createForClass(League).loadClass(League);
