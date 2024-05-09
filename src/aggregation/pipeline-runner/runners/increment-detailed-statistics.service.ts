import { InjectModel } from '@nestjs/mongoose';
import {
	DetailedStatistics,
	DetailedStatisticsDocument,
} from '../../../core/schemas/statistics/detailed-statistics.schema';
import { Runner } from '../interfaces/runner';
import { Logger } from '@nestjs/common';
import {
	LeanReportDocument,
	ReportDocument,
} from '../../../core/schemas/reports.schema';
import { Model } from 'mongoose';
import { ComputeDetailedStatisticsRunner } from './compute-detailed-statistics-runner.service';
import { Term, TermDocument } from '../../../core/schemas/terms.schema';

export class IncrementDetailedStatisticsRunner implements Runner {
	constructor(
		@InjectModel(DetailedStatistics.name)
		protected detailedStatsModel: Model<DetailedStatisticsDocument>,
		@InjectModel(Term.name) protected termModel: Model<TermDocument>,
		protected computeDetailedStatisticsRunner: ComputeDetailedStatisticsRunner,
	) {}

	logger = new Logger(IncrementDetailedStatisticsRunner.name);
	async runPipeline(report: ReportDocument | LeanReportDocument) {
		this.logger.debug('Running Increment Detailed Statistics Pipeline');
		const dayOfWeek = new Date(report.timestamp).getDay();
		const month = new Date(report.timestamp).getMonth();
		const filter = {
			resource_id: report.resource_id,
			curator_orcid: report.curator_orcid,
			league: report.league,
		};

		const term = await this.termModel.findOne({
			activity_term: report.activity_term,
			resource_id: report.resource_id,
			league: report.league,
		});

		const updateResult = await this.detailedStatsModel.updateOne(
			filter,
			{
				$inc: {
					total_count: 1,
					total_score: term.score,
					'activities.$[element].count': 1,
					'activities.$[element].total_score': term.score,
					[`daysOfWeek.${dayOfWeek}`]: 1,
					[`months.${month}`]: 1,
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

			await this.computeDetailedStatisticsRunner.runPipeline(filter);
		} else {
			this.logger.debug('Successfully Incremented detailed statistics');
		}
	}
}
