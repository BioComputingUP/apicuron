import { Injectable, Logger } from '@nestjs/common';
import { Document, FilterQuery, Model, Types } from 'mongoose';
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
import { updateMaxDate, updateMinDate } from '../helpers/fields-updater';
import {
	AggregatedReportsWeekly,
	ReportsWeeklyAggregationPipeline,
} from '../aggregations/reports-weekly.service';
import { PrivacyType } from '../../core/enums';
import { getLastWeekDate } from 'src/util/date.helper';
import { MongoServerError } from 'mongodb';
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

	initStat(
		report: AggregatedReportsWeekly | ReportDocument | LeanReportDocument,
	) {
		const stat = new this.weeklyStatModel({
			curator_orcid: report.curator_orcid,
			resource_id: report.resource_id,
			league: report.league,
			privacy: report.privacy,
			invalidation_count: 0,
			invalidation_score: 0,
			revision_count: 0,
			revision_score: 0,
			generation_count: 0,
			generation_score: 0,
			total_count: 0,
			total_score: 0,
			daysOfWeek: Array(7).fill(0),
		});
		return stat;
	}

	async updateWithReport(
		report:
			| ReportDocument
			| (Document<unknown, any, Report> & Report & { _id: Types.ObjectId })
			| LeanReportDocument,
	) {
		if (report.timestamp < getLastWeekDate()) {
			return;
		}
		const lastSavedReport = await this.reportModel
			.findOne({
				resource_id: report.resource_id,
				league: report.league,
				curator_orcid: report.curator_orcid,
			})
			.sort({ timestamp: -1 });

		const reportIsLast =
			!lastSavedReport ||
			(lastSavedReport &&
				lastSavedReport.timestamp.getTime() < report.timestamp.getTime());

		const term = await this.termModel.findOne({
			resource_id: report.resource_id,
			league: report.league,
		});

		const stat = await this.weeklyStatModel.findOne({
			resource_id: report.resource_id,
			league: report.league,
			curator_orcid: report.curator_orcid,
		});

		const dayOfWeek = report.timestamp.getDay();
		if (!stat) {
			const newStat = this.initStat(report);
			newStat[`${term.activity_category}_count`] = 1;
			newStat[`${term.activity_category}_score`] = term.score;
			newStat.total_count = 1;
			newStat.total_score = term.score;
			newStat.daysOfWeek[dayOfWeek] = 1;
			newStat.first_contribution = report.timestamp;
			newStat.last_contribution = report.timestamp;
			try {
				await newStat.save();
			} catch (err: any) {
				if (err instanceof MongoServerError && err.code === 11000) {
					return await this.updateWithReport(report);
				}
				throw new Error(err);
			}
			return;
		}

		const setObj = reportIsLast
			? {
					$set: {
						last_contribution: report.timestamp,
					},
			  }
			: null;

		await this.weeklyStatModel.updateOne(
			{
				resource_id: report.resource_id,
				league: report.league,
				curator_orcid: report.curator_orcid,
			},
			{
				$inc: {
					[`daysOfWeek.${dayOfWeek}`]: 1,
					[`${term.activity_category}_count`]: 1,
					[`${term.activity_category}_score`]: term.score,
					total_count: 1,
					total_score: term.score,
				},
				...setObj,
			},
			{
				upsert: true,
			},
		);
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
			} = reportAgg;
			if (!currentStat) {
				currentStat = this.initStat(reportAgg);
			}

			if (
				currentStat.resource_id !== resource_id ||
				currentStat.curator_orcid !== curator_orcid ||
				currentStat.league !== league
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

			// sum the days of the week with the current value
			currentStat.daysOfWeek = currentStat.daysOfWeek.map(
				(value, dayIndex) => reportAgg.days[dayIndex] + value,
			);
		}

		if (!!currentStat) {
			saves$.push(currentStat.save());
		}

		await Promise.all(saves$);
		this.logger.debug(`Computed ${saves$.length} weekly statistics`);
	}
}
