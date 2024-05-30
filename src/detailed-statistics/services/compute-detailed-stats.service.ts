import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import {
	DetailedStatistics,
	DetailedStatisticsDocument,
} from '../../core/schemas/statistics/detailed-statistics.schema';
import {
	LeanReportDocument,
	Report,
	ReportDocument,
} from '../../core/schemas/reports.schema';
import { Term, TermDocument } from '../../core/schemas/terms.schema';
import { MongoServerError } from 'mongodb';
import {
	DetailedStatAggregationResult,
	DetailedStatisticsPipeline,
} from '../aggregation/detailed-statistics-aggregation.service';
import {
	updateMaxDate,
	updateMinDate,
} from '../../weekly-statistics/helpers/fields-updater';
import { months } from '../../core/enums';
import { Logger } from '@nestjs/common';

export class ComputeDetailedStatisticsService {
	constructor(
		@InjectModel(DetailedStatistics.name)
		protected detailedStatsModel: Model<DetailedStatisticsDocument>,
		@InjectModel(Report.name)
		protected reportModel: Model<ReportDocument>,
		@InjectModel(Term.name)
		protected termModel: Model<TermDocument>,
		protected aggregationPipeline: DetailedStatisticsPipeline,
	) {}

	logger = new Logger(ComputeDetailedStatisticsService.name);

	initStat(
		report: ReportDocument | LeanReportDocument,
		term: TermDocument,
	): DetailedStatisticsDocument {
		return new this.detailedStatsModel({
			curator_orcid: report.curator_orcid,
			resource_id: report.resource_id,
			league: report.league,
			privacy: report.privacy,
			total_count: 1,
			total_score: term.score,
			last_contribution: report.timestamp,
			first_contribution: report.timestamp,
			activities: [
				{
					activity_term: report.activity_term,
					activity_category: term.activity_category,
					activity_name: term.activity_name,
					description: term.description,
					first_contribution: report.timestamp,
					last_contribution: report.timestamp,
					count: 1,
					score: term.score,
				},
			],
			daysOfWeek: Array(7).fill(0),
			months: Array(12).fill(0),
		});
	}

	async upsertDetailedStats(report: ReportDocument | LeanReportDocument) {
		const statFilter = {
			curator_orcid: report.curator_orcid,
			resource_id: report.resource_id,
			league: report.league,
		};
		const term$ = this.termModel.findOne({
			activity_term: report.activity_term,
			resource_id: report.resource_id,
			league: report.league,
		});

		const stat$ = this.detailedStatsModel.findOne(statFilter);

		const [term, stat] = await Promise.all([term$, stat$]);

		if (!stat) {
			const newStat = this.initStat(report, term);
			try {
				await newStat.save();
			} catch (err) {
				if (err instanceof MongoServerError && err.code == 11000) {
					return await this.upsertDetailedStats(report);
				}
			}
			return newStat;
		}

		stat.total_count += 1;
		stat.total_score += term.score;
		const actIndex = stat.activities.findIndex(
			(activity) => activity.activity_term == report.activity_term,
		);
		if (actIndex != -1) {
			stat.activities[actIndex].count += 1;
			stat.activities[actIndex].score += term.score;
			stat.activities[actIndex].last_contribution = report.timestamp;
		} else {
			stat.activities.push({
				activity_term: report.activity_term,
				activity_category: term.activity_category,
				activity_name: term.activity_name,
				description: term.description,
				first_contribution: report.timestamp,
				last_contribution: report.timestamp,
				count: 1,
				score: term.score,
				total_score: term.score,
			});
		}

		await stat.save();
	}

	async computeDetailedStats(filter: FilterQuery<ReportDocument> = {}) {
		const agg = this.aggregationPipeline
			.aggregate(filter)
			.cursor<DetailedStatAggregationResult>({ batchSize: 50 });

		let currentStat: DetailedStatisticsDocument | null = null;
		const statSaves$ = [];
		for await (const entry of agg) {
			const term = await this.termModel.findOne({
				resource_id: entry.resource_id,
				activity_term: entry.activity_term,
				league: entry.league,
			});
			if (
				currentStat &&
				(currentStat.resource_id !== entry.resource_id ||
					currentStat.curator_orcid !== entry.curator_orcid ||
					currentStat.league !== entry.league)
			) {
				const statSave$ = currentStat.save();
				statSaves$.push(statSave$);
				currentStat = null;
			}

			if (!currentStat) {
				currentStat = new this.detailedStatsModel({
					resource_id: entry.resource_id,
					curator_orcid: entry.curator_orcid,
					privacy: entry.privacy,
					league: entry.league,
					total_count: entry.count,
					total_score: entry.count * term.score,
					last_contribution: entry.last_contribution,
					first_contribution: entry.first_contribution,
					activities: [
						{
							activity_term: entry.activity_term,
							activity_category: term.activity_category,
							activity_name: term.activity_name,
							description: term.description,
							first_contribution: entry.first_contribution,
							last_contribution: entry.last_contribution,
							count: entry.count,
							score: term.score,
						},
					],
					daysOfWeek: entry.days,
					months: months.map((m) => entry.months[m] ?? 0),
				});
				continue;
			}

			currentStat.total_count += entry.count;
			currentStat.total_score += entry.count * term.score;
			currentStat.last_contribution = updateMaxDate(
				currentStat.last_contribution,
				entry.last_contribution,
			);
			currentStat.first_contribution = updateMinDate(
				currentStat.first_contribution,
				entry.first_contribution,
			);

			currentStat.activities.push({
				activity_term: entry.activity_term,
				activity_category: term.activity_category,
				activity_name: term.activity_name,
				description: term.description,
				first_contribution: entry.first_contribution,
				last_contribution: entry.last_contribution,
				count: entry.count,
				score: term.score,
				total_score: entry.count * term.score,
			});

			currentStat.daysOfWeek = currentStat.daysOfWeek.map(
				(day, i) => day + entry.days[i],
			);

			const entryMonthsCounts = months.map((m) => entry.months[m] ?? 0);

			currentStat.months = currentStat.months.map(
				(monthCount, i) => monthCount + entryMonthsCounts[i],
			);
		}

		await Promise.all(statSaves$);

		this.logger.log(`Computed ${statSaves$.length} detailed statistics`);
	}
}
