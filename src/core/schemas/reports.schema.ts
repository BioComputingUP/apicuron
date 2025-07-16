import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import {
	FilterQuery,
	HydratedDocument,
	LeanDocument,
	Model,
	ProjectionType,
	QueryOptions,
	Types,
} from 'mongoose';
import { PrivacyType } from '../enums';
import { IUserResourceEntity } from '../interfaces/user-resource-entity';
import { Term, TermSchema } from './terms.schema';
import { User, UserSchema } from './user.schema';
import {
	PartnerResource,
	PartnerResourceSchema,
} from './resource/partner-resource.schema';
import { League, LeagueSchema } from './league/league.schema';

export type ReportDocumentOverride = {
	term: Types.Subdocument<Types.ObjectId> & Term;
	user?: Types.Subdocument<Types.ObjectId> & User;
	resource: Types.Subdocument<Types.ObjectId> & PartnerResource;
	league_data?: Types.Subdocument<Types.ObjectId> & League;
};

export type ReportDocument = HydratedDocument<Report, ReportDocumentOverride>;

export type LeanReportDocument = LeanDocument<Report>;
export type ReportModel = Model<Report>;
export type ReportFilter = FilterQuery<Report>;
export type ReportProjection = ProjectionType<Report>;
export type ReportQueryOptions = QueryOptions<Report>;

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

	@Prop({
		required: false,
		type: TermSchema,
	})
	term: Term;

	@Prop({
		required: false,
		type: UserSchema,
	})
	user?: User;

	@Prop({
		required: false,
		type: PartnerResourceSchema,
	})
	resource: PartnerResource;

	@Prop({
		required: false,
		type: LeagueSchema,
	})
	league_data?: League;
}

const ReportSchema = SchemaFactory.createForClass(Report).loadClass(Report);

ReportSchema.index(
	{
		resource_id: 1,
		league: 1,
		entity_uri: 1,
		activity_term: 1,
		curator_orcid: 1,
		timestamp: 1,
	},
	{ unique: true, name: 'unique_index' },
);

export { ReportSchema };
