import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ComputeWeeklyStatisticsService } from '../services/compute-weekly-statistics.service';

@Injectable()
export class RunDailyPipelineJob {
	constructor(protected computeStats: ComputeWeeklyStatisticsService) {}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	async runDailyPipeline(): Promise<void> {
		await this.computeStats.computeWeeklyStatistics();
	}
}
