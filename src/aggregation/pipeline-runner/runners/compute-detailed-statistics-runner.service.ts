import { Injectable, Logger } from '@nestjs/common';
import { DetailedReportAggregationService } from '../../data-aggregation/aggregators/detailed-report-aggregation.service';
import { AggregatedReportIteratorService } from '../../data-iteration/iterators/aggregated-report-iterator.service';
import { Runner } from '../interfaces/runner';
import { InjectModel } from '@nestjs/mongoose';
import { Report, ReportDocument } from '../../../core/schemas/reports.schema';
import { FilterQuery, Model } from 'mongoose';
import { DetailedStatistics } from '../../../core/schemas/statistics/detailed-statistics.schema';
import { PartnerResourcesService } from '../../../resources/partner-resources/partner-resources.service';
import { computePrivacyField } from '../../../util/privacy.helper';
import { LeanActivitiesStatisticsDocument } from '../../../core/schemas/components/statistics-terms.schema';
import { DetailedAggregationResult } from '../../data-aggregation/interfaces/aggregation-results';
import { BaseReportIteratorResult } from '../../data-iteration/interfaces/base-report-iterator-result';
import { AggregateDaysService } from '../../data-aggregation/operations/aggregate-days.operation';
import { AggregateMonthsService } from '../../data-aggregation/operations/aggregate-months.operation';

@Injectable()
export class ComputeDetailedStatisticsRunner implements Runner {
	constructor(
		protected aggregator: DetailedReportAggregationService,
		protected iterator: AggregatedReportIteratorService,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
		@InjectModel(DetailedStatistics.name)
		protected statModel: Model<DetailedStatistics>,
		protected resourceService: PartnerResourcesService,
	) {}

	logger = new Logger(ComputeDetailedStatisticsRunner.name);

	private initStat({
		report,
		resource,
		user,
	}: BaseReportIteratorResult<DetailedAggregationResult>) {
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

	async runPipeline(filter: FilterQuery<ReportDocument> = {}) {
		const aggregation = this.aggregator.aggregate(this.reportModel, [
			{ $match: filter },
		]);

		const iterator = this.iterator.iterate(aggregation);

		let stat = null;
		const statSaves$ = [];
		for await (const aggregatedReport of iterator) {
			const { term, user, resource, report } = aggregatedReport;

			if (!stat) {
				stat = this.initStat(aggregatedReport);
			}
			if (
				stat.resource_id != report.resource_id ||
				stat.curator_orcid != report.curator_orcid ||
				stat.league != report.league
			) {
				statSaves$.push(stat.save());
				stat = stat = this.initStat(aggregatedReport);
			}

			computePrivacyField(resource, user, stat);
			const score = term.score;

			stat.total_count += report.count;
			stat.total_score += report.count * score;

			stat.last_contribution =
				stat.last_contribution > report.last_contribution
					? stat.last_contribution
					: report.last_contribution;

			stat.first_contribution =
				stat.first_contribution > report.first_contribution
					? report.first_contribution
					: stat.first_contribution;

			for (const day in report.days) {
				const dayIndex = AggregateDaysService.days.indexOf(day as any);
				stat.daysOfWeek[dayIndex] =
					report.days[day] + (stat.daysOfWeek[dayIndex] ?? 0);
			}

			for (const month in report.months) {
				const dayIndex = AggregateMonthsService.months.indexOf(month as any);
				stat.months[dayIndex] =
					report.months[month] + (stat.months[dayIndex] ?? 0);
			}

			if (!stat.activities) {
				stat.activities = [];
			}
			stat.activities.push({
				activity_term: report.activity_term,
				count: report.count,
				score: score,
				total_score: report.count * score,
				last_contribution: report.last_contribution,
				first_contribution: report.first_contribution,
				description: term.description,
				activity_category: term.activity_category,
				activity_name: term.activity_name,
			} as LeanActivitiesStatisticsDocument);
		}

		if (stat) {
			statSaves$.push(stat.save());
		}

		await Promise.all(statSaves$);

		this.logger.log(
			`Pipeline ran successfully, Computed ${statSaves$.length} Detailed stats`,
		);
	}
}
