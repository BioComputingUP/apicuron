import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
export type NotificationDocument = Notification & Document;

@Schema({ collection: 'notifications' })
export class Notification {
	@Prop({ required: true })
	title: string;

	@Prop({ required: true })
	body: string;

	@Prop({ required: true })
	orcid_id: string;

	@Prop({
		required: true,
		default() {
			return false;
		},
	})
	seen: Boolean;

	@Prop({
		default() {
			return Date.now();
		},
	})
	created_at: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
