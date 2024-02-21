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
import { ComputeAchievementsService } from './services/compute-achievements.service';
import { ComputeMedalsService } from './services/compute-medals.service';
import { ComputeBadgesService } from './services/compute-badges.service';
import { AchievementEventHandlerService } from './services/achievements-event-handler.service';
import { CacheModule } from '@nestjs/cache-manager';
import { AchievementsDefEventHandlerService } from './services/achievements-def-event-handler.service';

@Module({
	providers: [
		AchievementsDefService,
		AchievementsService,
		BadgeUnique,
		MedalUnique,
		ComputeMedalsService,
		ComputeBadgesService,
		ComputeAchievementsService,
		AchievementEventHandlerService,
		AchievementsDefEventHandlerService,
	],
	imports: [
		CoreApicuronModule,
		CacheModule.register({
			store: 'memory',
			shouldCloneBeforeSet: false,
		}),
		AuthModule,
		ResourcesModule,
	],
	exports: [
		AchievementsDefService,
		AchievementsService,
		ComputeAchievementsService,
		ComputeMedalsService,
		ComputeBadgesService,
	],
	controllers: [
		AchievementsController,
		AchievementsDefController,
		BadgesDefController,
		MedalsDefController,
	],
})
export class AchievementsModule {}
