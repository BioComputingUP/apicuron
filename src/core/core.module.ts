import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import {
	Report,
	ReportSchema,
	// ReportSchemaFactory,
} from './schemas/reports.schema';
import { Resource, ResourceSchema } from './schemas/resource/resource.schema';

import {
	SubmittedResource,
	SubmittedResourceSchema,
} from './schemas/resource/submitted-resource.schema';
import { PartnerResourceSchema } from './schemas/resource/partner-resource.schema';
import { PartnerResource } from './schemas/resource/partner-resource.schema';
import {
	Notification,
	NotificationSchema,
} from './schemas/notification.schema';
import { Term, TermSchema } from './schemas/terms.schema';
import {
	Statistics,
	StatisticsSchemaFactory,
} from './schemas/statistics.schema';
import {
	AchievementDef,
	AchievementDefSchemaFactory,
} from './schemas/achievements-def/achievement-def.schema';
import {
	Achievement,
	AchievementsSchemaFactory,
} from './schemas/achievements/achievements.schema';
import { Badge, BadgeSchema } from './schemas/achievements/badges.schema';
import { Medal, MedalSchema } from './schemas/achievements/medals.schema';
import {
	BadgeDef,
	BadgeDefSchema,
} from './schemas/achievements-def/badge-def.schema';
import {
	MedalDef,
	MedalDefSchema,
} from './schemas/achievements-def/medal-def.schema';
import { AchievementType } from './enums';
import {
	DetailedStatistics,
	DetailedStatisticsSchemaFactory,
} from './schemas/statistics/detailed-statistics.schema';
import {
	WeeklyStatistics,
	WeeklyStatisticsSchemaFactory,
} from './schemas/statistics/weekly-statistics.schema';
import { SyncIndexesService } from './services/sync-indexes.service';
import {
	MonthlyStatistics,
	MonthlyStatisticsSchemaFactory,
} from './schemas/statistics/monthly-statistics.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Report.name,
				schema: ReportSchema,
			},
			{
				name: User.name,
				schema: UserSchema,
			},
			{
				name: Resource.name,
				schema: ResourceSchema,
				discriminators: [
					{
						name: PartnerResource.name,
						schema: PartnerResourceSchema,
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
		]),
		MongooseModule.forFeatureAsync([
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
		]),
	],

	providers: [SyncIndexesService],

	exports: [MongooseModule],
})
export class CoreApicuronModule {}
