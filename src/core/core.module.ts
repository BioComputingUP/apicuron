import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Report, ReportSchema } from './schemas/reports.schema';
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
import { Statistics, StatisticsSchema } from './schemas/statistics.schema';
import {
	AchievementDef,
	AchievementDefSchema,
} from './schemas/achievement-def.schema';
import { Achievement, AchievementSchema } from './schemas/achievements.schema';
import { BadgeSchema } from './schemas/badges.schema';
import { MedalSchema } from './schemas/medals.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: User.name,
				schema: UserSchema,
			},
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
			},
			{
				name: AchievementDef.name,
				schema: AchievementDefSchema,
			},
			{
				name: Achievement.name,
				schema: AchievementSchema,
				discriminators: [
					{ name: 'badge', schema: BadgeSchema },
					{ name: 'medal', schema: MedalSchema },
				],
			},
		]),
	],
	exports: [MongooseModule],
})
export class CoreApicuronModule {}
