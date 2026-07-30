import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ContributorIndetifierType as ContributorIdentifierType } from 'src/core/enums';

@Schema({
	collection: 'pending-reports',
})
export class PendingReport {
	@Prop({ required: true })
	resource_id: string;

	@Prop({ required: true })
	entity_uri: string;

	@Prop({ required: true })
	activity_term: string;

	@Prop({ required: true })
	curator_orcid: string;

	@Prop({ required: true })
	timestamp: Date;

	@Prop({ required: true })
	contributor_identifier: string;

	@Prop({ required: true, enum: ContributorIdentifierType, type: String })
	contributor_identifier_type: ContributorIdentifierType;
}

export type PendingReportDocument = HydratedDocument<PendingReport>;
export const PendingReportSchema = SchemaFactory.createForClass(PendingReport);
