import { Module } from '@nestjs/common';
import {
	OldStatisticsController,
	StatisticsController,
} from './statistics/statistics.controller';
import { StatisticsService } from './statistics.service';
import { AuthModule } from '../auth/auth.module';
import { ResourcesModule } from '../resources/resources.module';
import { AchievementsModule } from '../achievements/achievements.module';
import { CoreApicuronModule } from '../core/core.module';
import { ComputeStatisticsService } from './compute-statistics.service';
@Module({
	imports: [
		CoreApicuronModule,
		AuthModule,
		ResourcesModule,
		AchievementsModule,
		// forwardRef(() => ReportsModule),
		// TransformerModule
	],
	controllers: [StatisticsController, OldStatisticsController],
	providers: [StatisticsService, ComputeStatisticsService],
	exports: [ComputeStatisticsService],
})
export class StatisticsModule {}
