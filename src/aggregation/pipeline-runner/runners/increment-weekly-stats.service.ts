import { Injectable, Logger } from '@nestjs/common';
import { Runner } from '../interfaces/runner';
import {
	LeanReportDocument,
	ReportDocument,
} from '../../../core/schemas/reports.schema';
import { getLastWeekDate } from '../../../weekly-statistics/helpers/last-week-date';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
	WeeklyStatistics,
	WeeklyStatisticsDocument,
} from '../../../core/schemas/statistics/weekly-statistics.schema';
import { Term, TermDocument } from '../../../core/schemas/terms.schema';
import { ComputeWeeklyStatisticsRunnerService } from './compute-weekly-statistics-runner.service';

@Injectable()
export class IncrementWeeklyStatisticsRunner implements Runner {
	constructor(
		@InjectModel(WeeklyStatistics.name)
		protected statModel: Model<WeeklyStatisticsDocument>,
		@InjectModel(Term.name) protected termModel: Model<TermDocument>,
		protected computeStatsRunner: ComputeWeeklyStatisticsRunnerService,
	) {}

	logger = new Logger(IncrementWeeklyStatisticsRunner.name);

	async runPipeline(report: ReportDocument | LeanReportDocument) {
		const date = new Date(report.timestamp);
		const lastWeekDate = getLastWeekDate();
		if (date < lastWeekDate) {
			// Report is older than last week, ignore
			return;
		}
		this.logger.debug('Running Increment Weekly statistics');

		const dayOfWeek = date.getDay();

		const term = await this.termModel.findOne({
			activity_term: report.activity_term,
			resource_id: report.resource_id,
			league: report.league,
		});

		const filter = {
			resource_id: report.resource_id,
			curator_orcid: report.curator_orcid,
			league: report.league,
		};

		// Increment weekly stats
		const updateResult = await this.statModel.updateOne(
			filter,
			{
				$inc: {
					total_count: 1,
					total_score: term.score,
					[`${term.activity_category}_count`]: 1,
					[`${term.activity_category}_score`]: term.score,
					[`daysOfWeek.${dayOfWeek}`]: 1,
				},
			},
			{
				arrayFilters: [
					{ 'element.activity_term': { $eq: report.activity_term } },
				],
			},
		);

		if (updateResult.modifiedCount <= 0) {
			this.logger.warn(
				`No documents matched the filter for report ${report._id}`,
			);

			await this.computeStatsRunner.runPipeline(filter);
		} else {
			this.logger.debug('Successfully Incremented Weekly statistics');
		}
	}
}
