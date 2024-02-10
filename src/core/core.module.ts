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
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AchievementType } from './enums';

@Module({
	imports: [
		EventEmitterModule,
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

			{
				name: AchievementDef.name,
				schema: AchievementDefSchema,
				discriminators: [
					{ name: BadgeDef.name, schema: BadgeDefSchema, value: 'badge' },
					{ name: MedalDef.name, schema: MedalDefSchema, value: 'medal' },
				],
			},
		]),
		MongooseModule.forFeatureAsync([
			{
				name: Statistics.name,
				useFactory: StatisticsSchemaFactory,
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
				name: EarnedAchievement.name,
				useFactory: EarnedAchievementsSchemaFactory,
				discriminators: [
					{
						name: EarnedBadge.name,
						schema: EarnedBadgeSchema,
						value: AchievementType.badge,
					},
					{
						name: EarnedMedal.name,
						schema: EarnedMedalSchema,
						value: AchievementType.medal,
					},
				],
			},

			// {
			// 	name: Report.name,
			// 	useFactory: ReportSchemaFactory,
			// 	inject: [EventEmitter2],
			// 	imports: [EventEmitterModule],
			// },
		]),
	],

	exports: [MongooseModule],
})
export class CoreApicuronModule {}
