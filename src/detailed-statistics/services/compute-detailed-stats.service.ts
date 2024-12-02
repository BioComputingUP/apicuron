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
import { Logger } from '@nestjs/common';
import {
	getMonthStart,
	getQuarterStart,
	getWeekStart,
	updateMaxDate,
	updateMinDate,
} from '../../util/date.helper';
import { UserRepository } from '../../core/repositories/user.repository';

export class ComputeDetailedStatisticsService {
	constructor(
		@InjectModel(DetailedStatistics.name)
		protected detailedStatsModel: Model<DetailedStatisticsDocument>,
		@InjectModel(Report.name)
		protected reportModel: Model<ReportDocument>,
		@InjectModel(Term.name)
		protected termModel: Model<TermDocument>,
		protected userRepository: UserRepository,
		protected aggregationPipeline: DetailedStatisticsPipeline,
	) {}

	logger = new Logger(ComputeDetailedStatisticsService.name);

	initStat(
		report: ReportDocument | LeanReportDocument,
		term: TermDocument,
	): DetailedStatisticsDocument {
		const stat = new this.detailedStatsModel({
			user: report.user,
			resource: report.resource,
			league_data: report.league_data,
			curator_orcid: report.curator_orcid,
			resource_id: report.resource_id,
			league: report.league,
			privacy: report.privacy,
			total_count: 1,
			total_score: term.score,
			last_contribution: report.timestamp,
			first_contribution: report.timestamp,
			last_week_count: 0,
			last_month_count: 0,
			last_quarter_count: 0,
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

		if (report.timestamp > getWeekStart()) {
			stat.last_week_count += 1;
			stat.last_month_count += 1;
			stat.last_quarter_count += 1;
		} else if (report.timestamp > getMonthStart()) {
			stat.last_month_count += 1;
			stat.last_quarter_count += 1;
		} else if (report.timestamp > getQuarterStart()) {
			stat.last_quarter_count += 1;
		}

		return stat;
	}

	async upsertDetailedStats(
		report: ReportDocument | LeanReportDocument,
		termDoc: TermDocument = null,
	) {
		const statFilter = {
			curator_orcid: report.curator_orcid,
			resource_id: report.resource_id,
			league: report.league,
		};

		// if termDoc is not provided, fetch the term from the database
		const term$ = !!termDoc
			? Promise.resolve(termDoc)
			: this.termModel.findOne({
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

		stat.user = report.user;
		stat.resource = report.resource;
		stat.league_data = report.league_data;

		stat.total_count += 1;
		stat.total_score += term.score;

		const isLastWeek = report.timestamp > getWeekStart() ? 1 : 0;
		const isLastMonth = report.timestamp > getMonthStart() ? 1 : 0;
		const isLastQuarter = report.timestamp > getQuarterStart() ? 1 : 0;

		stat.last_week_count += isLastWeek;
		stat.last_month_count += isLastMonth;
		stat.last_quarter_count += isLastQuarter;

		const actIndex = stat.activities.findIndex(
			(activity) => activity.activity_term == report.activity_term,
		);
		if (actIndex == -1) {
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
				last_week_count: isLastWeek,
				last_month_count: isLastMonth,
				last_quarter_count: isLastQuarter,
			});
		} else {
			stat.activities[actIndex].count += 1;
			stat.activities[actIndex].score += term.score;
			stat.activities[actIndex].last_contribution = report.timestamp;
			stat.activities[actIndex].last_week_count += isLastWeek;
			stat.activities[actIndex].last_month_count += isLastMonth;
			stat.activities[actIndex].last_quarter_count += isLastQuarter;
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
			// load the relevant term
			const term =
				entry.term ??
				(await this.termModel.findOne({
					resource_id: entry.resource_id,
					activity_term: entry.activity_term,
					league: entry.league,
				}));

			// Check if the currentStat that is being computed is different from the current entry
			// If it is different, save the currentStat and set the current Stat to null
			if (
				!!currentStat &&
				(currentStat.resource_id !== entry.resource_id ||
					currentStat.curator_orcid !== entry.curator_orcid ||
					currentStat.league !== entry.league)
			) {
				const statSave$ = currentStat.save();
				statSaves$.push(statSave$);
				currentStat = null;
			}

			// if there is no currentStat, instantiate a new one
			if (!currentStat) {
				const user =
					entry.user ??
					(await this.userRepository.findOne({
						orcid_id: entry.curator_orcid,
					}));
				const [resource, league_data] = [entry.resource, entry.league_data];
				currentStat = new this.detailedStatsModel({
					user,
					resource,
					league_data,
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
							last_week_count: entry.last_week_count,
							last_month_count: entry.last_month_count,
							last_quarter_count: entry.last_quarter_count,
						},
					],
					last_week_count: entry.last_week_count,
					last_month_count: entry.last_month_count,
					last_quarter_count: entry.last_quarter_count,
				});
				continue;
			}

			// set the values for the currentStat
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
			currentStat.last_week_count += entry.last_week_count;
			currentStat.last_month_count += entry.last_month_count;
			currentStat.last_quarter_count += entry.last_quarter_count;

			// push the current entry to the activities array
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
				last_week_count: entry.last_week_count,
				last_month_count: entry.last_month_count,
				last_quarter_count: entry.last_quarter_count,
			});
		}

		await Promise.all(statSaves$);

		this.logger.log(`Computed ${statSaves$.length} detailed statistics`);
	}

	async reComputeStatsRelatedToTerm(term: TermDocument) {
		await this.detailedStatsModel.deleteMany({
			resource_id: term.resource_id,
			league: term.league,
			'activities.activity_term': term.activity_term,
		});

		await this.computeDetailedStats({
			resource_id: term.resource_id,
			league: term.league,
			activity_term: term.activity_term,
		});
	}
}
