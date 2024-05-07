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
import { ComputeStatisticsService } from './compute-statistics/compute-statistics.service';
import { CacheModule } from '@nestjs/cache-manager';
import { StatisticsEventHandlerService } from './events/event-handler.service';
import { OrcidClientModule } from '../orcid-client/orcid-client.module';
import { DataAggregationModule } from '../data-aggregation/data-aggregation.module';
import { DataIteratorModule } from '../data-iteration/aggregated-report-iterator.module';
import { PipelineRunnerModule } from '../pipeline-runner/pipeline-runner.module';

@Module({
	imports: [
		CoreApicuronModule,
		AuthModule,
		ResourcesModule,
		AchievementsModule,
		OrcidClientModule,
		CacheModule.register({
			max: 100,
			shouldCloneBeforeSet: false,
		}),
		DataAggregationModule,
		DataIteratorModule,
		PipelineRunnerModule,
	],
	controllers: [StatisticsController, OldStatisticsController],
	providers: [
		StatisticsService,
		ComputeStatisticsService,
		StatisticsEventHandlerService,
	],
	exports: [ComputeStatisticsService],
})
export class StatisticsModule {}
