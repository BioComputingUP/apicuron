import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ContributorIdentifierType, PendingReportStatus } from 'src/core/enums';

@Schema({
	collection: 'pending-reports',
	timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class PendingReportDB {
	@Prop({ required: true })
	resource_id: string;

	@Prop({ required: true })
	entity_uri: string;

	@Prop({ required: true })
	activity_term: string;

	@Prop({ required: true })
	timestamp: Date;

	@Prop({ required: true, index: true })
	contributor_identifier: string;

	@Prop({ required: true, enum: ContributorIdentifierType, type: String })
	contributor_identifier_type: ContributorIdentifierType;

	@Prop({
		required: true,
		enum: PendingReportStatus,
		type: String,
		default: PendingReportStatus.PENDING,
	})
	status: PendingReportStatus;

	@Prop({ type: String })
	error?: string;

	@Prop({ required: true, default: 0 })
	reconciliation_attempt_count: number;

	@Prop({ type: Date })
	reconciled_at?: Date;

	created_at: Date;
	updated_at: Date;
}

export type PendingReportDocument = HydratedDocument<PendingReportDB>;
export const PendingReportSchema =
	SchemaFactory.createForClass(PendingReportDB);

PendingReportSchema.index({
	contributor_identifier: 1,
	contributor_identifier_type: 1,
	status: 1,
});

PendingReportSchema.index(
	{
		resource_id: 1,
		contributor_identifier: 1,
		contributor_identifier_type: 1,
		timestamp: 1,
		activity_term: 1,
		entity_uri: 1,
	},
	{ unique: true, name: 'pending_reports_unique_index' },
);
