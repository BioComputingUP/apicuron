import { Module } from '@nestjs/common';
import { CoreApicuronModule } from '../core/core.module';
import { DetailedStatisticsController } from './controllers/detailed-statistics.controller';
import { DetailedStatisticsService } from './services/detailed-statistics.service';
import { AuthModule } from '../auth/auth.module';
import { PipelineRunnerModule } from '../aggregation/pipeline-runner/pipeline-runner.module';

@Module({
	imports: [CoreApicuronModule, AuthModule, PipelineRunnerModule],
	controllers: [DetailedStatisticsController],
	providers: [DetailedStatisticsService],
})
export class DetailedStatisticsModule {}
