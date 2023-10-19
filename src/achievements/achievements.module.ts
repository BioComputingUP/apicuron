import { Module } from '@nestjs/common';
import { AchievementsDefService } from './achievements-def.service';
import { AchievementsService } from './achievements.service';
import { AchievementsController } from './controllers/achievements.controller';
import {
	AchievementsDefController,
	BadgesDefController,
	MedalsDefController,
} from './controllers/achievements-def.controller';
import { BadgeUnique, MedalUnique } from './validators/achievement-exists';
import { AuthModule } from '../auth/auth.module';
import { ResourcesModule } from '../resources/resources.module';
import { CoreApicuronModule } from '../core/core.module';

@Module({
	providers: [
		AchievementsDefService,
		AchievementsService,
		BadgeUnique,
		MedalUnique,
	],
	imports: [CoreApicuronModule, AuthModule, ResourcesModule],
	exports: [AchievementsDefService, AchievementsService],
	controllers: [
		AchievementsController,
		AchievementsDefController,
		BadgesDefController,
		MedalsDefController,
	],
})
export class AchievementsModule {}
