import { FilterQuery, Model } from 'mongoose';
import {
	WeeklyStatistics,
	WeeklyStatisticsDocument,
} from '../../core/schemas/statistics/weekly-statistics.schema';
import { Runner } from '../interfaces/runner';
import { InjectModel } from '@nestjs/mongoose';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { Logger } from '@nestjs/common';
import { PartnerResourcesService } from '../../resources/partner-resources/partner-resources.service';
import { AggregatedReportIteratorService } from '../../data-iteration/iterators/aggregated-report-iterator.service';
import { BaseReportAggregationService } from '../../data-aggregation/aggregators/base-report-aggregation.service';
import { computePrivacyField } from '../../util/privacy.helper';
import { BaseReportIteratorResult } from '../../data-iteration/interfaces/base-report-iterator-result';

export class ComputeWeeklyStatisticsRunnerService implements Runner {
	constructor(
		@InjectModel(WeeklyStatistics.name)
		protected statModel: Model<WeeklyStatisticsDocument>,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
		protected aggregator: BaseReportAggregationService,
		protected iterator: AggregatedReportIteratorService,
		protected resourceService: PartnerResourcesService,
	) {}

	private initStat({ report, resource, user }: BaseReportIteratorResult) {
		const stat = new this.statModel({
			resource_id: report.resource_id,
			curator_orcid: report.curator_orcid,
			league:
				report.league ??
				this.resourceService.getUserLeague(resource, user.orcid_id),
		});

		stat.first_contribution = report.first_contribution;
		stat.last_contribution = report.last_contribution;
		return stat;
	}
	logger: Logger = new Logger(ComputeWeeklyStatisticsRunnerService.name);
	async runPipeline(filter: FilterQuery<ReportDocument> = {}) {
		const lastWeekDate = new Date(
			new Date().getTime() - 7 * 24 * 60 * 60 * 1000,
		);
		lastWeekDate.setHours(0, 0, 0, 0);
		const aggregation = this.aggregator.aggregate(this.reportModel, [
			{ $match: filter },
			{
				$match: {
					timestamp: { $gte: lastWeekDate },
				},
			},
		]);
		const iterator = this.iterator.iterate(aggregation);

		let stat = null;
		const statSaves$ = [];
		for await (const aggregatedReport of iterator) {
			const { report, resource, term, user } = aggregatedReport;

			if (!stat) {
				stat = this.initStat(aggregatedReport);
			}

			if (
				stat.resource_id != report.resource_id ||
				stat.curator_orcid != report.curator_orcid ||
				stat.league != report.league
			) {
				statSaves$.push(stat.save());
				stat = this.initStat(aggregatedReport);
			}
			computePrivacyField(resource, user, stat);
			const score = term.score;

			stat.total_count += report.count;
			stat.total_score += report.count * score;
			const activity_category = term.activity_category;

			stat[`${activity_category}_count`] += report.count;
			stat[`${activity_category}_score`] += report.count * score;

			stat.last_contribution =
				stat.last_contribution > report.last_contribution
					? stat.last_contribution
					: report.last_contribution;

			stat.first_contribution =
				stat.first_contribution > report.first_contribution
					? report.first_contribution
					: stat.first_contribution;
		}

		if (stat) {
			statSaves$.push(stat.save());
		}

		await Promise.all(statSaves$);

		this.logger.log(
			`Pipeline ran successfully, Computed ${statSaves$.length} stats`,
		);
	}
}
