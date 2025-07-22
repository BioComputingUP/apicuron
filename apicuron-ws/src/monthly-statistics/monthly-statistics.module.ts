import { Module } from '@nestjs/common';
import { CoreApicuronModule } from '../core/core.module';
import { ResourcesModule } from '../resources/resources.module';
import { AuthModule } from '../auth/auth.module';
import { ComputeMonthlyStatsService } from './services/compute-monthly-stats.service';
import { MonthlyStatisticsAggregator } from './services/monthly-stat-aggregator.service';
import { MonthlyStatisticsController } from './controllers/monthly-stat.controller';
import { ReportsMonthlyAggregator } from './aggregations/reports-monthly-aggregator';
import { MonthlyStatisticsService } from './services/monthly-stat.service';

@Module({
	imports: [CoreApicuronModule, AuthModule, ResourcesModule],
	providers: [
		MonthlyStatisticsService,
		ReportsMonthlyAggregator,
		ComputeMonthlyStatsService,
		MonthlyStatisticsAggregator,
	],
	controllers: [MonthlyStatisticsController],
})
export class MonthlyStatisticsModule {}
