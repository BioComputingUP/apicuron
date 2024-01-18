import { Module } from '@nestjs/common';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Report, ReportSchemaFactory } from './schemas/reports.schema';
import {
	PartnerResource,
	PartnerResourceSchema,
	Resource,
	ResourceSchema,
	SubmittedResource,
	SubmittedResourceSchema,
} from './schemas/resource.schema';
import {
	Notification,
	NotificationSchema,
} from './schemas/notification.schema';
import { Term, TermSchema } from './schemas/terms.schema';
import {
	PrivateStatistics,
	PrivateStatisticsSchema,
	PublicStatistics,
	PublicStatisticsSchema,
	Statistics,
	StatisticsSchema,
} from './schemas/statistics.schema';
import {
	AchievementDef,
	AchievementDefSchema,
} from './schemas/achievement-def.schema';
import {
	Achievement,
	AchievementsSchemaFactory,
	EarnedAchievement,
	EarnedAchievementsSchemaFactory,
} from './schemas/achievements.schema';
import {
	Badge,
	BadgeSchema,
	EarnedBadge,
	EarnedBadgeSchema,
} from './schemas/badges.schema';
import {
	EarnedMedal,
	EarnedMedalSchema,
	Medal,
	MedalSchema,
} from './schemas/medals.schema';
import { BadgeDef, BadgeDefSchema } from './schemas/badge-def.schema';
import { MedalDef, MedalDefSchema } from './schemas/medal-def.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
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
			{
				name: Statistics.name,
				schema: StatisticsSchema,
				discriminators: [
					{
						name: PublicStatistics.name,
						schema: PublicStatisticsSchema,
						value: 'public',
					},
					{
						name: PrivateStatistics.name,
						schema: PrivateStatisticsSchema,
						value: 'private',
					},
				],
			},
			{
				name: AchievementDef.name,
				schema: AchievementDefSchema,
				discriminators: [
					{ name: BadgeDef.name, schema: BadgeDefSchema, value: 'badge' },
					{ name: MedalDef.name, schema: MedalDefSchema, value: 'medal' },
				],
			},
			// {
			// 	name: Achievement.name,
			// 	schema: AchievementSchema,
			// 	discriminators: [
			// 		{ name: Badge.name, schema: BadgeSchema, value: 'badge' },
			// 		{ name: Medal.name, schema: MedalSchema, value: 'medal' },
			// 	],
			// },
		]),
		MongooseModule.forFeatureAsync([
			{
				inject: [getModelToken(User.name)],
				imports: [
					MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
				],
				name: Report.name,
				useFactory: ReportSchemaFactory,
			},
			{
				name: EarnedAchievement.name,
				useFactory: EarnedAchievementsSchemaFactory,
				discriminators: [
					{ name: EarnedBadge.name, schema: EarnedBadgeSchema, value: 'badge' },
					{ name: EarnedMedal.name, schema: EarnedMedalSchema, value: 'medal' },
				],
			},

			{
				name: Achievement.name,
				useFactory: AchievementsSchemaFactory,
				discriminators: [
					{ name: Badge.name, schema: BadgeSchema, value: 'badge' },
					{ name: Medal.name, schema: MedalSchema, value: 'medal' },
				],
			},
		]),
	],

	exports: [MongooseModule],
})
export class CoreApicuronModule {}
