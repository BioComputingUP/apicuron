import { AsyncModelFactory, ModelDefinition } from '@nestjs/mongoose';
import { AchievementType } from '../enums';
import {
	AchievementDef,
	AchievementDefSchemaFactory,
} from './achievements-def/achievement-def.schema';
import { BadgeDef, BadgeDefSchema } from './achievements-def/badge-def.schema';
import { MedalDef, MedalDefSchema } from './achievements-def/medal-def.schema';
import {
	Achievement,
	AchievementsSchemaFactory,
} from './achievements/achievements.schema';
import { Badge, BadgeSchema } from './achievements/badges.schema';
import { Medal, MedalSchema } from './achievements/medals.schema';
import { Statistics, StatisticsSchemaFactory } from './statistics.schema';
import {
	DetailedStatistics,
	DetailedStatisticsSchemaFactory,
} from './statistics/detailed-statistics.schema';
import {
	MonthlyStatistics,
	MonthlyStatisticsSchemaFactory,
} from './statistics/monthly-statistics.schema';
import {
	WeeklyStatistics,
	WeeklyStatisticsSchemaFactory,
} from './statistics/weekly-statistics.schema';
import { Notification, NotificationSchema } from './notification.schema';
import { Report, ReportSchema } from './reports.schema';
import {
	PartnerResource,
	PartnerResourceSchema,
	PartnerResourceSchemaFactory,
} from './resource/partner-resource.schema';
import { Resource, ResourceSchema } from './resource/resource.schema';
import {
	SubmittedResource,
	SubmittedResourceSchema,
} from './resource/submitted-resource.schema';
import { Term, TermSchema } from './terms.schema';
import { User, UserSchema, userCollectionSchemaFactory } from './user.schema';
import { CuratorRegistryEntry, CuratorRegistryEntrySchema } from './curator-registry/curator-entry.schema';

export const ModelFactories: AsyncModelFactory[] = [
	{
		name: AchievementDef.name,
		useFactory: AchievementDefSchemaFactory,
		discriminators: [
			{ name: BadgeDef.name, schema: BadgeDefSchema, value: 'badge' },
			{ name: MedalDef.name, schema: MedalDefSchema, value: 'medal' },
		],
	},
	{
		name: Achievement.name,
		useFactory: AchievementsSchemaFactory,
		discriminators: [
			{
				name: Badge.name,
				schema: BadgeSchema,
				value: AchievementType.badge,
			},
			{
				name: Medal.name,
				schema: MedalSchema,
				value: AchievementType.medal,
			},
		],
	},
	{
		name: DetailedStatistics.name,
		useFactory: DetailedStatisticsSchemaFactory,
	},
	{
		name: Statistics.name,
		useFactory: StatisticsSchemaFactory,
	},
	{
		name: WeeklyStatistics.name,
		useFactory: WeeklyStatisticsSchemaFactory,
	},
	{
		name: MonthlyStatistics.name,
		useFactory: MonthlyStatisticsSchemaFactory,
	},
	{
		name: User.name,
		useFactory: userCollectionSchemaFactory,
	},
	
];

export const ModelDefinitions: ModelDefinition[] = [
	{
		name: Report.name,
		schema: ReportSchema,
	},
	{
		name: Resource.name,
		schema: ResourceSchema,
		discriminators: [
			{
				name: PartnerResource.name,
				schema: PartnerResourceSchemaFactory()
			},
			{
				name: SubmittedResource.name,
				schema: SubmittedResourceSchema,
			},
		],
	},

	{
		schema: NotificationSchema,
		name: Notification.name,
	},
	{
		name: Term.name,
		schema: TermSchema,
	},
	{
		name: CuratorRegistryEntry.name,
		schema: CuratorRegistryEntrySchema,
	},
];
