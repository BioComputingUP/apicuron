import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { PrivacyType } from '../../enums';
import { HydratedDocument } from 'mongoose';
import { AchievementDef } from '../achievements-def/achievement-def.schema';
import { Term } from '../terms.schema';
import { League, LeagueSchema } from '../league/league.schema';
import { ResourceStats, ResourceStatsSchema } from './resource-stats.schema';

export type PartnerResourceDocument = HydratedDocument<PartnerResource>;

// this class defines a partnerResource that has been validated and has the ability to have Models, Badges and so on

@Schema()
export class PartnerResource {
	@Prop()
	resource_description: string;

	@Prop({ required: true, unique: true })
	resource_id: string;

	@Prop()
	resource_long_name: string;

	@Prop({ required: true, unique: true })
	resource_name: string;

	@Prop({ required: true, unique: true })
	resource_uri: string;

	@Prop({ required: true, unique: true })
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
		required: false,
	})
	stats?: ResourceStats;

	@Prop({ required: true, type: Date })
	joined_date: Date;

	getLeague(leagueName: string) {
		return this.leagues.find((league: League) => league.name == leagueName);
	}
}
const PartnerResourceSchema =
	SchemaFactory.createForClass(PartnerResource).loadClass(PartnerResource);

export class ResourceSummary extends PartnerResource {
	badges: AchievementDef[];
	medals: AchievementDef[];
	terms: Term[];
}

export { PartnerResourceSchema };
