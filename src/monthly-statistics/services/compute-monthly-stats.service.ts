import { Injectable, Logger } from '@nestjs/common';
import {
	MonthlyStatistics,
	MonthlyStatisticsDocument,
} from '../../core/schemas/statistics/monthly-statistics.schema';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
	LeanReportDocument,
	Report,
	ReportDocument,
} from '../../core/schemas/reports.schema';
import { TermDocument } from '../../core/schemas/terms.schema';
import { getRelatedMonthlyStatFilter } from '../helpers';
import {
	fromYearMonth,
	getMonthEnd,
	getMonthStart,
	updateMaxDate,
	updateMinDate,
} from '../../util/date.helper';
import * as moment from 'moment-timezone';
import { ReportsMonthlyAggregator } from '../aggregations/reports-monthly-aggregator';
import { AggregatedReportsMonthly } from '../interfaces';
import { PrivacyType } from '../../core/enums';
import { UserDocument } from '../../core/schemas/user.schema';
import { PartnerResourceDocument } from '../../core/schemas/resource/partner-resource.schema';
import { MongoServerError } from 'mongodb';
@Injectable()
export class ComputeMonthlyStatsService {
	constructor(
		@InjectModel(MonthlyStatistics.name)
		protected monthlyStatsModel: Model<MonthlyStatisticsDocument>,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
		protected monthlyReportAggregator: ReportsMonthlyAggregator,
	) {}

	logger = new Logger(ComputeMonthlyStatsService.name);

	async applyReport(
		report: ReportDocument | LeanReportDocument,
		term: TermDocument,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		resource: PartnerResourceDocument,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		curator?: UserDocument,
	) {
		const relatedMonthlyStatFilter = getRelatedMonthlyStatFilter(report);

		// we retrieve the last saved report from that month
		const reportIsLast = !(await this.reportModel.exists({
			resource_id: report.resource_id,
			league: report.league,
			curator_orcid: report.curator_orcid,
			timestamp: {
				$gte: report.timestamp,
			},
		}));

		const setObj: UpdateQuery<MonthlyStatisticsDocument>['$set'] = {
			resource: report.resource ?? resource,
			user: report.user ?? curator ?? null,
			league_data: report.league_data,
		};
		if (reportIsLast) {
			setObj.last_contribution = report.timestamp;
		}
		try {
			const result = await this.monthlyStatsModel.findOneAndUpdate(
				relatedMonthlyStatFilter,
				{
					$inc: {
						[`${term.activity_category}_count`]: 1,
						[`${term.activity_category}_score`]: term.score,
						total_count: 1,
						total_score: term.score,
					},
					$set: setObj,
					$setOnInsert: {
						first_contribution: report.timestamp,
					},
				},
				{
					upsert: true,
					new: true,
				},
			);
			// this.logger.log(`${result.curator_orcid}: ${result.total_score}`);
			return result;
		} catch (err) {
			if (err instanceof MongoServerError && err.code == 11000) {
				await this.applyReport(report, term, resource, curator);
			}
		}
	}

	private initStat(
		reportAgg: AggregatedReportsMonthly | ReportDocument | LeanReportDocument,
	) {
		const stat = new this.monthlyStatsModel({
			curator_orcid: reportAgg.curator_orcid,
			resource_id: reportAgg.resource_id,
			league: reportAgg.league,
			resource: reportAgg.resource,
			user: reportAgg.user ?? null,
			league_data: reportAgg.league_data,
			privacy: reportAgg.privacy,
			invalidation_count: 0,
			invalidation_score: 0,
			revision_count: 0,
			revision_score: 0,
			generation_count: 0,
			generation_score: 0,
			total_count: 0,
			total_score: 0,
		});

		const refDate =
			'month' in reportAgg && 'year' in reportAgg // reportAgg is an AggregatedReportsMonthly
				? fromYearMonth(reportAgg.year, reportAgg.month) // reportAgg is a ReportDocument
				: reportAgg.timestamp;

		const [monthStart, monthEnd] = [
			getMonthStart(moment(refDate)),
			getMonthEnd(moment(refDate)),
		];

		stat.monthStart = monthStart;
		stat.monthEnd = monthEnd;

		return stat;
	}

	async computeMonthlyStats(reportFilter: FilterQuery<ReportDocument>) {
		const aggregation = this.monthlyReportAggregator
			.aggregate(reportFilter)
			.cursor<AggregatedReportsMonthly>({
				batchSize: 100,
			});

		let currentStat: MonthlyStatisticsDocument | null = null;
		const saves$ = [];

		for await (const reportAgg of aggregation) {
			const {
				curator_orcid,
				resource_id,
				league,
				privacy,
				activity_category,
				score,
				year,
				month,
			} = reportAgg;

			const monthDate = fromYearMonth(year, month);

			if (!currentStat) {
				currentStat = this.initStat(reportAgg);
			}

			if (
				currentStat.resource_id !== resource_id ||
				currentStat.curator_orcid !== curator_orcid ||
				currentStat.league !== league ||
				currentStat.monthStart.getTime() !=
					getMonthStart(monthDate).getTime() ||
				currentStat.monthEnd.getTime() != getMonthEnd(monthDate).getTime()
			) {
				saves$.push(currentStat.save());
				currentStat = this.initStat(reportAgg);
			}

			currentStat.total_count += reportAgg.count;
			currentStat.total_score += reportAgg.count * score;

			currentStat.first_contribution = updateMinDate(
				currentStat.first_contribution ?? null,
				reportAgg.first_contribution,
			);
			currentStat.last_contribution = updateMaxDate(
				currentStat.last_contribution ?? null,
				reportAgg.last_contribution,
			);
			// update the count, score and totalScore
			currentStat[`${activity_category}_count`] += reportAgg.count;
			currentStat[`${activity_category}_score`] += reportAgg.count * score;
			// currentStat.total_score += reportAgg.count * score;

			currentStat.privacy = privacy as PrivacyType;
		}

		if (!!currentStat) {
			saves$.push(currentStat.save());
		}

		await Promise.all(saves$);
		this.logger.debug(`Computed ${saves$.length} monthly statistics`);
	}

	async recomputeMonthlyStatistics() {
		await this.monthlyStatsModel.deleteMany({});
		await this.computeMonthlyStats({});
	}

	async deleteStats(filter: FilterQuery<MonthlyStatisticsDocument>) {
		return await this.monthlyStatsModel.deleteMany(filter);
	}
}
