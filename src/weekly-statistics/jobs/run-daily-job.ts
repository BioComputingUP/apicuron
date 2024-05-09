import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ComputeWeeklyStatisticsRunnerService } from '../../aggregation/pipeline-runner/runners/compute-weekly-statistics-runner.service';

@Injectable()
export class RunDailyPipelineJob {
	constructor(protected pipelineRunner: ComputeWeeklyStatisticsRunnerService) {}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	async runDailyPipeline(): Promise<void> {
		await this.pipelineRunner.runPipeline();
	}
}
