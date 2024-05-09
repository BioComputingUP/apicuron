import { Module } from '@nestjs/common';
import { CoreApicuronModule } from '../../core/core.module';
import { ComputeStatisticsRunnerService } from './runners/compute-statistics-runner.service';
import { ComputeDetailedStatisticsRunner } from './runners/compute-detailed-statistics-runner.service';
import { ComputeWeeklyStatisticsRunnerService } from './runners/compute-weekly-statistics-runner.service';
import { AllStatisticsPipelinesOrchestratorService } from './orchestrators/all-statistics-pipelines.service';
import { ResourcesModule } from '../../resources/resources.module';
import { DataAggregationModule } from '../data-aggregation/data-aggregation.module';
import { DataIteratorModule } from '../data-iteration/aggregated-report-iterator.module';
import { AchievementsModule } from '../../achievements/achievements.module';
import { IncrementDetailedStatisticsRunner } from './runners/increment-detailed-statistics.service';
import { IncrementWeeklyStatisticsRunner } from './runners/increment-weekly-stats.service';

@Module({
	imports: [
		CoreApicuronModule,
		DataAggregationModule,
		DataIteratorModule,
		ResourcesModule,
		AchievementsModule,
	],
	controllers: [],
	providers: [
		ComputeStatisticsRunnerService,
		ComputeDetailedStatisticsRunner,
		ComputeWeeklyStatisticsRunnerService,
		IncrementDetailedStatisticsRunner,
		IncrementWeeklyStatisticsRunner,
		AllStatisticsPipelinesOrchestratorService,
	],
	exports: [
		// ComputeStatisticsRunnerService,
		ComputeDetailedStatisticsRunner,
		ComputeWeeklyStatisticsRunnerService,
		AllStatisticsPipelinesOrchestratorService,
	],
})
export class PipelineRunnerModule {}
