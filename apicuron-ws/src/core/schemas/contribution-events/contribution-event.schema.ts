import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { ContributorIdentifierType, EventOutputKind, EventOutputStatus, EventProcessingStatus } from 'src/core/enums';

@Schema({ _id: false })
export class EventOutput {
	@Prop({ required: true, type: String, enum: Object.values(EventOutputKind) })
	kind: EventOutputKind;

	@Prop({ required: true, type: String })
	activity_term: string;

	@Prop({ required: true, type: String })
	contributor_identifier: string;

	@Prop({ required: true, type: String, enum: Object.values(ContributorIdentifierType) })
	contributor_identifier_type: ContributorIdentifierType;

	@Prop({ required: true, type: String, enum: Object.values(EventOutputStatus) })
	status: EventOutputStatus;

	@Prop({ type: String })
	error?: string;
}
export const EventOutputSchema = SchemaFactory.createForClass(EventOutput);

@Schema({ _id: false })
export class EventProcessing {
	@Prop({
		required: true,
		type: String,
		enum: Object.values(EventProcessingStatus),
		default: EventProcessingStatus.RECEIVED,
	})
	status: EventProcessingStatus;

	@Prop({ type: String })
	interpreter_version?: string;

	@Prop({ type: Date })
	processed_at?: Date;

	@Prop({ type: String })
	error?: string;

	@Prop({ required: true, type: Number, default: 0 })
	attempts: number;
}
export const EventProcessingSchema = SchemaFactory.createForClass(EventProcessing);

@Schema({
	collection: 'contribution-events',
	timestamps: { createdAt: 'received_at', updatedAt: 'updated_at' },
})
export class ContributionEventDB {
	@Prop({ required: true, type: String })
	event_id: string;

	@Prop({ required: true, type: String })
	source: string;

	@Prop({ required: true, type: String })
	type: string;

	@Prop({ required: true, type: String })
	subject: string;

	@Prop({ required: true, type: Date })
	time: Date;

	@Prop({ required: true, type: String })
	dataschema: string;

	@Prop({ required: true, type: String })
	resource_id: string;

	// The full event as received; interpreted at read time via dataschema, never modified
	@Prop({ required: true, type: MongooseSchema.Types.Mixed })
	payload: Record<string, unknown>;

	@Prop({
		type: EventProcessingSchema,
		default: () => ({ status: EventProcessingStatus.RECEIVED, attempts: 0 }),
	})
	processing: EventProcessing;

	@Prop({ type: [EventOutputSchema], default: [] })
	outputs: EventOutput[];

	received_at: Date;
	updated_at: Date;
}

export const ContributionEventSchema = SchemaFactory.createForClass(ContributionEventDB);

ContributionEventSchema.index(
	{ source: 1, event_id: 1 },
	{ unique: true, name: 'contribution_events_unique_index' },
);
ContributionEventSchema.index({ 'processing.status': 1 }, { name: 'contribution_events_status_index' });
ContributionEventSchema.index({ resource_id: 1 }, { name: 'contribution_events_resource_index' });

export type ContributionEventDocument = HydratedDocument<ContributionEventDB>;