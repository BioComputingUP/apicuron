import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AchievementsDefService } from './achievements-def.service';
import {
	AchievementDef,
	AchievementDefSchema,
} from './schemas/achievement-def.schema';
import { Achievement, AchievementSchema } from './schemas/achievements.schema';
import { BadgeSchema } from './schemas/badges.schema';
import { BadgeDefSchema } from './schemas/badges_def.schema';
import { MedalSchema } from './schemas/medals.schema';
import { MedalDefSchema } from './schemas/medals_def.schema';
import { AchievementsService } from './achievements.service';

@Module({
	providers: [AchievementsDefService, AchievementsService],
	imports: [
		MongooseModule.forFeature([
			{
				name: AchievementDef.name,
				schema: AchievementDefSchema,
				// discriminators: [
				// 	{ name: 'badge', schema: BadgeDefSchema },
				// 	{ name: 'medal', schema: MedalDefSchema },
				// ],
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
	exports: [AchievementsDefService, AchievementsService],
})
export class AchievementsModule {}
