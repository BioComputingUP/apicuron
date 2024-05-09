import { Injectable, Logger } from '@nestjs/common';
import { ComputeWeeklyStatisticsRunnerService } from '../runners/compute-weekly-statistics-runner.service';
import { ComputeStatisticsRunnerService } from '../runners/compute-statistics-runner.service';
import { ComputeDetailedStatisticsRunner } from '../runners/compute-detailed-statistics-runner.service';
import { FilterQuery } from 'mongoose';
import {
	LeanReportDocument,
	ReportDocument,
} from '../../../core/schemas/reports.schema';
import { IncrementDetailedStatisticsRunner } from '../runners/increment-detailed-statistics.service';
import { IncrementWeeklyStatisticsRunner } from '../runners/increment-weekly-stats.service';

@Injectable()
export class AllStatisticsPipelinesOrchestratorService {
	constructor(
		protected computeWeeklyStatsRunner: ComputeWeeklyStatisticsRunnerService,
		protected computeStatsRunner: ComputeStatisticsRunnerService,
		protected computeDetailedStatsRunner: ComputeDetailedStatisticsRunner,
		protected incrementalDetailedStatsRunner: IncrementDetailedStatisticsRunner,
		protected incrementalWeeklyStatsRunner: IncrementWeeklyStatisticsRunner,
	) {}

	logger = new Logger(AllStatisticsPipelinesOrchestratorService.name);
	/**
	 * Runs all statistics pipelines.
	 * @returns {Promise<void>} A promise that resolves when all statistics pipelines have finished running.
	 */
	async runAllPipelines(filter: FilterQuery<ReportDocument> = {}) {
		const promises$ = [
			this.computeWeeklyStatsRunner.runPipeline(filter),
			this.computeStatsRunner.runPipeline(filter),
			this.computeDetailedStatsRunner.runPipeline(filter),
		];
		const results = await Promise.allSettled(promises$);
		results.forEach((result, index) => {
			if (result.status === 'rejected') {
				this.logger.error(result.reason);
				throw new Error(
					`Process from ${index} failed with error: ${result.reason}`,
				);
			}
		});
	}

	async runIncrementalPipelines(report: ReportDocument | LeanReportDocument) {
		const promises$ = [
			this.incrementalDetailedStatsRunner.runPipeline(report),
			this.incrementalWeeklyStatsRunner.runPipeline(report),
		];
		const results = await Promise.allSettled(promises$);
		results.forEach((result, index) => {
			if (result.status === 'rejected') {
				this.logger.error(result.reason);
				throw new Error(
					`Process from ${index} failed with error: ${result.reason}`,
				);
			}
		});
	}
}
