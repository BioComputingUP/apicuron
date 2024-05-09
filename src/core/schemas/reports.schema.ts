import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, LeanDocument } from 'mongoose';
import { PrivacyType } from '../enums';
import { IUserResourceEntity } from '../interfaces/user-resource-entity';

export type ReportDocument = HydratedDocument<Report>;

export type LeanReportDocument = LeanDocument<ReportDocument>;
@Schema({
	collection: 'reports',
})
export class Report implements IUserResourceEntity {
	@Prop({ required: true, type: String })
	resource_id: string;

	@Prop({ required: true, type: String })
	privacy: PrivacyType;

	@Prop({ required: true, type: String })
	league: string;

	@Prop({
		required: true,
	})
	activity_term: string;

	@Prop({ required: true, type: String })
	curator_orcid: string;

	@Prop({ required: true })
	entity_uri: string;

	@Prop({ required: false })
	resource_uri?: string;

	@Prop({
		required: true,
		type: Date,
	})
	timestamp: Date;

	getMetaFields() {
		return {
			privacy: this.privacy,
		};
	}
}

const ReportSchema = SchemaFactory.createForClass(Report).loadClass(Report);

export { ReportSchema };
