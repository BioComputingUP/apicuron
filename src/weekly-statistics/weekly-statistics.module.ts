import { Module } from '@nestjs/common';
import { CoreApicuronModule } from '../core/core.module';
import { AuthModule } from '../auth/auth.module';
import { WeeklyStatisticsController } from './controller/weekly-statistics.controller';
import { WeeklyStatisticsService } from './services/weekly-statistics.service';
import { RunDailyPipelineJob } from './jobs/run-daily-job';
import { PipelineRunnerModule } from '../aggregation/pipeline-runner/pipeline-runner.module';
import { ResourcesModule } from '../resources/resources.module';

@Module({
	imports: [
		CoreApicuronModule,
		AuthModule,
		ResourcesModule,
		PipelineRunnerModule,
	],
	controllers: [WeeklyStatisticsController],
	providers: [WeeklyStatisticsService, RunDailyPipelineJob],
})
export class WeeklyStatisticsModule {}
