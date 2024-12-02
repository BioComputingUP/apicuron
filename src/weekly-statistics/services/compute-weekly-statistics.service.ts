import { Injectable, Logger } from '@nestjs/common';
import { Document, FilterQuery, Model, Types, UpdateQuery } from 'mongoose';
import {
	LeanReportDocument,
	Report,
	ReportDocument,
} from '../../core/schemas/reports.schema';
import { InjectModel } from '@nestjs/mongoose';
import {
	WeeklyStatistics,
	WeeklyStatisticsDocument,
} from '../../core/schemas/statistics/weekly-statistics.schema';
import { Term, TermDocument } from '../../core/schemas/terms.schema';
import {
	AggregatedReportsWeekly,
	ReportsWeeklyAggregationPipeline,
} from '../aggregations/reports-weekly.service';
import { PrivacyType } from '../../core/enums';
import { MongoServerError } from 'mongodb';
import {
	fromDate,
	fromYearWeek,
	getWeekStart,
	getWeekEnd,
	updateMinDate,
	updateMaxDate,
	getWeekRange,
} from '../../util/date.helper';
import * as moment from 'moment-timezone';
import { PartnerResourceDocument } from '../../core/schemas/resource/partner-resource.schema';
import { UserDocument } from '../../core/schemas/user.schema';
import { computePrivacyField } from '../../util/privacy.helper';
@Injectable()
export class ComputeWeeklyStatisticsService {
	logger = new Logger(ComputeWeeklyStatisticsService.name);
	constructor(
		@InjectModel(WeeklyStatistics.name)
		protected weeklyStatModel: Model<WeeklyStatisticsDocument>,
		@InjectModel(Report.name)
		protected reportModel: Model<ReportDocument>,
		@InjectModel(Term.name)
		protected termModel: Model<TermDocument>,
		protected weeklyStatAggPipeline: ReportsWeeklyAggregationPipeline,
	) {}

	isReportDocument(report: any): report is ReportDocument {
		return report instanceof this.reportModel;
	}

	isLeanReportDocument(report: any): report is LeanReportDocument {
		return report instanceof Object && 'resource_id' in report;
	}
	isAggregatedReportsWeekly(report: any): report is AggregatedReportsWeekly {
		return typeof report.year == 'number' && typeof report.week == 'number';
	}

	initStat(
		report: AggregatedReportsWeekly | ReportDocument | LeanReportDocument,
	) {
		let week;
		let first_contribution, last_contribution;
		if (this.isReportDocument(report) || this.isLeanReportDocument(report)) {
			week = fromDate(report.timestamp);
			first_contribution = report.timestamp;
			last_contribution = report.timestamp;
		}
		if (this.isAggregatedReportsWeekly(report)) {
			week = fromYearWeek(report.year, report.week);
			first_contribution = report.first_contribution;
			last_contribution = report.last_contribution;
		}
		const [start, end] = [getWeekStart(week), getWeekEnd(week)];
		const stat = new this.weeklyStatModel({
			curator_orcid: report.curator_orcid,
			resource_id: report.resource_id,
			league: report.league,
			privacy: report.privacy,
			resource: report.resource,
			user: report.user,
			league_data: report.league_data,
			term: report.term,
			invalidation_count: 0,
			invalidation_score: 0,
			revision_count: 0,
			revision_score: 0,
			generation_count: 0,
			generation_score: 0,
			total_count: 0,
			total_score: 0,
			first_contribution,
			last_contribution,
			weekStart: start,
			weekEnd: end,
		});
		return stat;
	}

	async updateWithReport(
		report:
			| ReportDocument
			| (Document<unknown, any, Report> & Report & { _id: Types.ObjectId })
			| LeanReportDocument,
		termDoc: TermDocument | null,
		resource: PartnerResourceDocument,
		user: UserDocument | null,
	) {
		const reportIsLast = !(await this.reportModel.exists({
			resource_id: report.resource_id,
			league: report.league,
			curator_orcid: report.curator_orcid,
			timestamp: {
				$gt: report.timestamp,
			},
		}));

		const term = !termDoc
			? await this.termModel.findOne({
					resource_id: report.resource_id,
					league: report.league,
			  })
			: termDoc;

		const [weekStart, weekEnd] = getWeekRange(moment(report.timestamp));

		const setObj: UpdateQuery<WeeklyStatisticsDocument>['$set'] = {
			privacy: computePrivacyField(resource, user, {
				league: report.league,
			}),
			user: report.user ?? user,
			league_data: report.league_data,
			resource: report.resource ?? resource,
		};
		if (reportIsLast) {
			setObj.last_contribution = report.timestamp;
		}
		try {
			await this.weeklyStatModel.findOneAndUpdate(
				{
					resource_id: report.resource_id,
					league: report.league,
					curator_orcid: report.curator_orcid,
					weekStart: weekStart,
					weekEnd: weekEnd,
				},
				{
					$inc: {
						[`${term.activity_category}_count`]: 1,
						[`${term.activity_category}_score`]: term.score,
						total_count: 1,
						total_score: term.score,
					},
					$setOnInsert: {
						first_contribution: report.timestamp,
					},
					$set: setObj,
				},
				{
					upsert: true,
					new: true,
				},
			);
		} catch (err: any) {
			if (err instanceof MongoServerError && err.code === 11000) {
				return await this.updateWithReport(report, term, resource, user);
			}
			throw new Error(err);
		}
	}

	async recomputeWeeklyStatistics(
		filter: FilterQuery<ReportDocument> &
			FilterQuery<WeeklyStatisticsDocument> = {},
	) {
		await this.weeklyStatModel.deleteMany(filter);
		await this.computeWeeklyStatistics(filter);
	}

	async computeWeeklyStatistics(
		reportFilter: FilterQuery<ReportDocument> = {},
	) {
		// Compute weekly statistics
		const aggregation = this.weeklyStatAggPipeline
			.aggregate(reportFilter)
			.cursor<AggregatedReportsWeekly>({
				batchSize: 100,
			});

		let currentStat: WeeklyStatisticsDocument | null = null;
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
				week,
			} = reportAgg;

			const weekDate = fromYearWeek(year, week);
			if (!currentStat) {
				currentStat = this.initStat(reportAgg);
			}

			if (
				currentStat.resource_id !== resource_id ||
				currentStat.curator_orcid !== curator_orcid ||
				currentStat.league !== league ||
				currentStat.weekStart.getTime() != getWeekStart(weekDate).getTime() ||
				currentStat.weekEnd.getTime() != getWeekEnd(weekDate).getTime()
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
			currentStat.total_score += reportAgg.count * score;

			currentStat.privacy = privacy as PrivacyType;
		}

		if (!!currentStat) {
			saves$.push(currentStat.save());
		}

		await Promise.all(saves$);
		this.logger.debug(`Computed ${saves$.length} weekly statistics`);
	}
}
