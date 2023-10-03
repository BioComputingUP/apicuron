import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type BadgeDocument = Badge & Document;

@Schema({
	collection: 'achievements',
	// toJSON: {
	// 	transform: function (doc, ret) {
	// 		delete ret._id;
	// 		return ret
	// 	},
	// },
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
}

export const BadgeSchema = SchemaFactory.createForClass(Badge);
