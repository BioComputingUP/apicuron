import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type AchievementDocument = Achievement & Document;

@Schema({ collection: 'achievements', discriminatorKey: 'type' })
export class Achievement {
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
		type: String,
		required: true,
		enum: ['badge', 'medal'],
	})
	type: string;
}

export const AchievementSchema = SchemaFactory.createForClass(Achievement);
