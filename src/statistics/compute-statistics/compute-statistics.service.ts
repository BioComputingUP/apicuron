import { Injectable, Logger } from '@nestjs/common';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../core/schemas/user.schema';
import {
	Statistics,
	StatisticsDocument,
} from '../../core/schemas/statistics.schema';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import { FilterQuery, LeanDocument, Model } from 'mongoose';
import { MongoServerError } from 'mongodb';
import { TermDocument } from '../../core/schemas/terms.schema';
import {
	computeAggregatePrivacyField,
	computePrivacyField,
} from '../../util/privacy.helper';
import {
	BaseAggregationResult,
	BaseReportIteratorResult,
	StatisticsReportAggregator,
} from '../aggregation/aggregate-reports.service';
import {
	updateMaxDate,
	updateMinDate,
} from '../../weekly-statistics/helpers/fields-updater';
@Injectable()
export class ComputeStatisticsService {
	logger = new Logger(ComputeStatisticsService.name);
	constructor(
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
		@InjectModel(Statistics.name)
		protected statModel: Model<StatisticsDocument>,
		@InjectModel(User.name) protected userModel: Model<UserDocument>,
		protected partnerResourceService: PartnerResourcesService,
		private reportAggregator: StatisticsReportAggregator,
	) {}

	private getRelatedStatsFilter(
		report: ReportDocument | Report | LeanDocument<Report>,
	): FilterQuery<StatisticsDocument> {
		const statFilter: FilterQuery<StatisticsDocument> = {};
		if (report.curator_orcid) {
			statFilter.curator_orcid = report.curator_orcid;
		}
		if (report.resource_id) {
			statFilter.resource_id = report.resource_id;
		}
		if (report.league) {
			statFilter.league = report.league;
		}
		return statFilter;
	}

	private getRelatedTermFilter(
		report: ReportDocument | Report | LeanDocument<Report>,
	): FilterQuery<TermDocument> & {
		resource_id: string;
		activity_term: string;
		league: string;
	} {
		const { resource_id, activity_term, league } = report;
		return {
			resource_id,
			activity_term,
			league,
		};
	}

	async upsertStatByReport(
		report: (ReportDocument | Report | LeanDocument<Report>) & {
			count?: number;
		},
	): Promise<void> {
		this.logger.debug('Upserting stat by report');
		const { resource_id, curator_orcid, activity_term, league } = report;
		const reportCount = report.count ?? 1;

		if (!reportCount) {
			this.logger.error(
				'ReportCount was found null or undefined' + reportCount,
			);
		}

		const term = await this.reportAggregator.getTerm(
			this.getRelatedTermFilter(report),
		);
		if (!term) {
			this.logger.warn(
				`Warning, report found with term ${activity_term} but no corresponding term was found, deleting report`,
			);

			await this.reportModel.deleteMany({
				activity_term: report.activity_term,
			});
			return null;
		}
		const scoreIncrement = term.score * reportCount;

		try {
			await this.statModel.findOneAndUpdate(
				this.getRelatedStatsFilter(report),
				{
					$inc: {
						[term.activity_category + '_count']: reportCount,
						total_count: reportCount,
						[term.activity_category + '_score']: scoreIncrement,
						total_score: scoreIncrement,
					},
					$setOnInsert: {
						curator_orcid,
						resource_id,
						league,
					},
				},
				{
					upsert: true,
					rawResult: true,
				},
			);
			this.logger.debug(
				`upserted Regular Statistics for user ${report.curator_orcid} at resource ${report.resource_id} and league ${report.league}`,
			);
			return;
		} catch (err: any) {
			if (!(err instanceof MongoServerError) || err.code != 11000) {
				this.logger.error(err.message, err.stack, err.name);
				throw new Error(
					`Failed to update statistics for user: ${curator_orcid} at the resource ${resource_id} `,
				);
			}
			this.logger.verbose('Error upserting document update, attempt to update');

			await this.statModel.findOneAndUpdate(
				this.getRelatedStatsFilter(report),
				{
					$inc: {
						[term.activity_category + '_count']: reportCount,
						total_count: reportCount,
						[term.activity_category + '_score']: scoreIncrement,
						total_score: scoreIncrement,
					},
				},
			);

			this.logger.debug(
				`updated statistics for user ${report.curator_orcid} at resource ${report.resource_id} and league ${report.league}`,
			);

			return;
		}
	}

	private reportIsRelatedToStat(
		report: ReportDocument,
		stat: StatisticsDocument,
	): boolean {
		return (
			report.resource_id === stat.resource_id &&
			report.curator_orcid === stat.curator_orcid &&
			report.league === stat.league
		);
	}

	private aggregateReportsByActivity(filter: FilterQuery<ReportDocument> = {}) {
		return this.reportModel
			.aggregate()
			.match(filter)
			.group({
				_id: {
					resource_id: '$resource_id',
					curator_orcid: '$curator_orcid',
					league: '$league',
					activity_term: '$activity_term',
				},
				resource_id: {
					$first: '$resource_id',
				},
				curator_orcid: {
					$first: '$curator_orcid',
				},
				league: {
					$first: '$league',
				},
				activity_term: {
					$first: '$activity_term',
				},
				count: {
					$sum: 1,
				},
			})
			.sort({
				resource_id: -1,
				curator_orcid: -1,
				league: -1,
				activity_term: -1,
			});
	}

	updateSingleStat(
		stat: StatisticsDocument,
		{ resource, report, term }: BaseReportIteratorResult<BaseAggregationResult>,
	) {
		stat.privacy = computeAggregatePrivacyField(
			{ privacy: resource.getLeague(report.league).visibility },
			report,
		);
		const activity_category = term.activity_category;
		const score = term.score;
		stat[`${activity_category}_count`] += report.count;
		stat[`${activity_category}_score`] += report.count * score;
		if (!stat[`${activity_category}_terms`]) {
			stat[`${activity_category}_terms`] = [];
		}

		stat.total_count += report.count;
		stat.total_score += report.count * score;

		stat.last_contribution = updateMaxDate(
			stat.last_contribution,
			report.last_contribution,
		);
		stat.first_contribution = updateMinDate(
			stat.first_contribution,
			report.first_contribution,
		);
	}

	/**
	 * Computes statistics based on the provided filter.
	 * @param filter - The filter query to apply when fetching reports.
	 * @returns {Promise<void>} - A promise that resolves when the statistics computation is complete.
	 */
	async computeStatistics(filter: FilterQuery<ReportDocument> = {}) {
		// const statFilter = this.getRelatedStatsFilter(new this.reportModel(filter));

		// const delResponse = await this.statModel.deleteMany(statFilter);

		// this.logger.debug(
		// 	`Deleted ${delResponse.deletedCount} documents, acknowledged ${delResponse.acknowledged} `,
		// );
		const statSaves$ = [];

		const reportsByTerms = this.reportAggregator.iterate(filter);

		let currentStat = null;
		for await (const { resource, report, term } of reportsByTerms) {
			if (!currentStat) {
				// instantiate a new stat object if the current stat is null
				currentStat = new this.statModel({
					resource_id: report.resource_id,
					curator_orcid: report.curator_orcid,
					league: report.league,
				});
			}
			if (
				currentStat.resource_id != report.resource_id ||
				currentStat.curator_orcid != report.curator_orcid ||
				currentStat.league != report.league
			) {
				statSaves$.push(currentStat.save());
				currentStat = new this.statModel({
					resource_id: report.resource_id,
					curator_orcid: report.curator_orcid,
					league: report.league,
				});
			}

			this.updateSingleStat(currentStat, { resource, report, term });
		}

		if (currentStat) {
			statSaves$.push(currentStat.save());
		}

		await Promise.all(statSaves$);

		this.logger.debug(`Computed ${statSaves$.length} statistics`);
	}

	async incrementStatByReport(
		report: ReportDocument | Report | LeanDocument<Report>,
	) {
		const statFilter = await this.getRelatedStatsFilter(report);

		const statExists = await this.statModel.exists(statFilter);
		if (statExists) {
			return await this.upsertStatByReport(report);
		}

		const term$ = this.reportAggregator
			.getTerm(this.getRelatedTermFilter(report))
			.then((term) => term.toObject() as LeanDocument<TermDocument>);
		const resource$ = this.partnerResourceService.get_resource(
			report.resource_id,
		);
		const user$ = this.userModel.findOne({
			orcid_id: report.curator_orcid,
		});

		const [termObj, resource, user] = await Promise.all([
			term$,
			resource$,
			user$,
		]);

		delete termObj._id;

		const stat = new this.statModel({
			...statFilter,
			total_count: 1,
			total_score: 1 * termObj.score,
			[termObj.activity_category + '_count']: 1,
			[termObj.activity_category + '_score']: 1 * termObj.score,
			[termObj.activity_category + '_terms']: [
				{
					...termObj,
					count: 1,
					sum: termObj.score,
				},
			],
			first_contribution: report.timestamp,
			last_contribution: report.timestamp,
		});
		stat.privacy = computePrivacyField(resource, user, stat);

		await stat.save();
	}
}
