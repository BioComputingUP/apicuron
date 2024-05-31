import { Module } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { AchievementsController } from './controllers/achievements.controller';
import { AuthModule } from '../auth/auth.module';
import { ResourcesModule } from '../resources/resources.module';
import { CoreApicuronModule } from '../core/core.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
	providers: [
		AchievementsService,
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
	exports: [AchievementsService],
	controllers: [AchievementsController],
})
export class AchievementsModule {}
