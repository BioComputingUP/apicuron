import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, LeanDocument } from 'mongoose';
import { PrivacyType } from '../enums';
import { ResourceEntity } from './components/resource-entity.schema';

export type ReportDocument = HydratedDocument<Report>;

export type ReportLeanDocument = LeanDocument<Report>;
@Schema({
	collection: 'reports',
})
export class Report extends ResourceEntity {
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
