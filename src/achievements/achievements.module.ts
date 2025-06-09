import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CoreApicuronModule } from '../core/core.module';
import { ResourcesModule } from '../resources/resources.module';
import { AchievementsService } from './achievements.service';
import { AchievementsController } from './controllers/achievements.controller';

@Module({
	providers: [AchievementsService],
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
