import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { PrivacyType } from '../../enums';
import {
	FilterQuery,
	HydratedDocument,
	Model,
	ProjectionType,
	QueryOptions,
	Types,
} from 'mongoose';
import { AchievementDef } from '../achievements-def/achievement-def.schema';
import { Term } from '../terms.schema';
import { League, LeagueSchema } from '../league/league.schema';
import { ResourceStats, ResourceStatsSchema } from './resource-stats.schema';

type PartnerResourceDocumentOverride = {
	leagues: Types.DocumentArray<League>;
	stats: Types.Subdocument<Types.ObjectId> & ResourceStats;
};

export type PartnerResourceDocument = HydratedDocument<
	PartnerResource,
	PartnerResourceDocumentOverride
>;

// this class defines a partnerResource that has been validated and has the ability to have Models, Badges and so on
export type PartnerResourceModel = Model<
	PartnerResource,
	{},
	PartnerResourceDocumentOverride
>;
export type PartnerResourceFilter = FilterQuery<PartnerResource>;
export type PartnerResourceProjection = ProjectionType<PartnerResource>;
export type PartnerResourceQueryOptions = QueryOptions<PartnerResource>;

@Schema()
export class PartnerResource {
	@Prop()
	resource_description: string;

	@Prop({ required: true })
	resource_id: string;

	@Prop()
	resource_long_name: string;

	@Prop({ required: true })
	resource_name: string;

	@Prop({ required: true })
	resource_uri: string;

	@Prop({ required: true })
	resource_url: string;

	@Prop({ required: false })
	logo: string;

	@Prop()
	color: string;

	state: string;

	@Prop({
		required: true,
		type: [LeagueSchema],
		default: function (): League[] {
			return [
				{
					name: 'default',
					defaultMembers: [],
					visibility: PrivacyType.public,
					displayedName: 'Default Group',
					resource_id: this.resource_id,
				},
			];
		},
	})
	leagues: League[];

	@Prop({
		required: true,
		type: String,
		default: () => 'default',
	})
	defaultLeague: string;

	@Prop({
		type: ResourceStatsSchema,
		required: true,
		default: (val) => ({ resource_id: val.resource_id }),
	})
	stats: ResourceStats;

	@Prop({ required: true, type: Date })
	joined_date: Date;

	@Prop({
		type: [String],
		default: ['https://identifiers.org', 'https://doi.org'],
		required: true,
	})
	allowedUrlsPrefix: string[];

	getLeague(leagueName: string): League {
		return this.leagues.find((league: League) => league.name == leagueName);
	}

	created_at: Date;
	updated_at: Date;
}
const PartnerResourceSchema =
	SchemaFactory.createForClass(PartnerResource).loadClass(PartnerResource);

export class ResourceSummary extends PartnerResource {
	badges: AchievementDef[];
	medals: AchievementDef[];
	terms: Term[];
}

export function PartnerResourceSchemaFactory() {
	const ResourceSchema =
		SchemaFactory.createForClass(PartnerResource).loadClass(PartnerResource);

	ResourceSchema.index(
		{
			resource_id: 1,
			resource_name: 1,
			resource_uri: 1,
			resource_url: 1,
		},
		{ unique: true, name: 'unique_resource' },
	);

	return ResourceSchema;
}

export { PartnerResourceSchema };
