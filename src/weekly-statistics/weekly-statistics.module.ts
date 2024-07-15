import { Module } from '@nestjs/common';
import { CoreApicuronModule } from '../core/core.module';
import { AuthModule } from '../auth/auth.module';
import { WeeklyStatisticsController } from './controller/weekly-statistics.controller';
import { WeeklyStatisticsService } from './services/weekly-statistics.service';
import { RunDailyPipelineJob } from './jobs/run-daily-job';
import { ResourcesModule } from '../resources/resources.module';
import { WeeklyStatisticsAggregatorService } from './services/weekly-stat-aggregator.service';
import { ComputeWeeklyStatisticsService } from './services/compute-weekly-statistics.service';
import { ReportsWeeklyAggregationPipeline } from './aggregations/reports-weekly.service';
import { EventOrchestratorModule } from '../event-orchestrator/event-orchestrator.module';
import { EventOrchestratorModuleOptions } from '../event-orchestrator/interfaces/event-orchestrator-options.interface';

@Module({
	imports: [
		CoreApicuronModule,
		AuthModule,
		ResourcesModule,
		EventOrchestratorModule.registerAsync({
			imports: [WeeklyStatisticsModule],
			inject: [WeeklyStatisticsAggregatorService],
			useFactory(
				weeklyStatAggregator: WeeklyStatisticsAggregatorService,
			): EventOrchestratorModuleOptions {
				return {
					aggregator: weeklyStatAggregator,
				};
			},
		}),
	],
	controllers: [WeeklyStatisticsController],
	providers: [
		WeeklyStatisticsService,
		ReportsWeeklyAggregationPipeline,
		ComputeWeeklyStatisticsService,
		WeeklyStatisticsAggregatorService,
		RunDailyPipelineJob,
	],
	exports: [WeeklyStatisticsAggregatorService]
})
export class WeeklyStatisticsModule {}
