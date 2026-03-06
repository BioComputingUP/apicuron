import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
	FilterQuery,
	HydratedDocument,
	Model,
	ProjectionType,
	QueryOptions,
	Types
} from 'mongoose';
import { PrivacyType, ResourceCategories, ResourceCategory } from '../../enums';
import { AchievementDef } from '../achievements-def/achievement-def.schema';
import {
	LeaderboardSettings,
	LeaderboardType,
} from '../components/leaderboard-preferences.schema';
import { GitRepository } from '../components/git-repository.schema';
import { League, LeagueSchema } from '../league/league.schema';
import { Term } from '../terms.schema';
import { isCategory, requiresGithubRepo } from './resource-category.helpers';
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

	@Prop({ required: false, type: LeaderboardSettings })
	leaderboard_preferences: LeaderboardSettings;

	getLeaderBoardSettings<T extends LeaderboardType>(
		leaderboardType: T,
	): LeaderboardSettings[T] {
		return this.leaderboard_preferences[leaderboardType];
	}

	getLeague(leagueName: string): League | undefined {
		return this.leagues.find((league: League) => league.name == leagueName);
	}

	@Prop({
		type: String,
		required: true,
		default: ResourceCategory.Database,
		enum: ResourceCategories,
	})
	category: ResourceCategory;

	@Prop({
		type: GitRepository,
		required: requiresGithubRepo(),
	})
	repository: GitRepository;

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
