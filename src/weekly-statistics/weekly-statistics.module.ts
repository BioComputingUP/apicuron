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

@Module({
	imports: [CoreApicuronModule, AuthModule, ResourcesModule],
	controllers: [WeeklyStatisticsController],
	providers: [
		WeeklyStatisticsService,
		ReportsWeeklyAggregationPipeline,
		ComputeWeeklyStatisticsService,
		WeeklyStatisticsAggregatorService,
		RunDailyPipelineJob,
	],
})
export class WeeklyStatisticsModule {}
