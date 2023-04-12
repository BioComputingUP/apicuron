import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AchievementsDefService } from './achievements-def.service';
import {
	AchievementDef,
	AchievementDefSchema,
} from './schemas/achievement-def.schema';
import { Achievement, AchievementSchema } from './schemas/achievements.schema';
import { BadgeSchema } from './schemas/badges.schema';
import { MedalSchema } from './schemas/medals.schema';
import { AchievementsService } from './achievements.service';
import { AchievementsController } from './controllers/achievements.controller';
import { AchievementsDefController, BadgesDefController, MedalsDefController } from './controllers/achievements-def.controller';
import { BadgeUnique, MedalUnique } from './validators/achievement-exists'
import { AuthModule } from '../auth/auth.module';
import { ResourcesModule } from '../resources/resources.module';

@Module({
	providers: [AchievementsDefService, AchievementsService, BadgeUnique, MedalUnique],
	imports: [
		AuthModule,
		ResourcesModule,
		MongooseModule.forFeature([
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
	exports: [AchievementsDefService, AchievementsService, MongooseModule],
	controllers: [AchievementsController, AchievementsDefController, BadgesDefController, MedalsDefController],
})
export class AchievementsModule {}
