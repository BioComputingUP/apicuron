import { Inject, Injectable, Logger } from '@nestjs/common';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../core/schemas/user.schema';
import {
	Statistics,
	StatisticsDocument,
} from '../../core/schemas/statistics.schema';
import { PartnerResourcesService } from '../../resources/partner-resources/partner-resources.service';
import { FilterQuery, LeanDocument, Model } from 'mongoose';
import { MongoServerError } from 'mongodb';
import { Term, TermDocument } from '../../core/schemas/terms.schema';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { computePrivacyField } from '../../util/privacy.helper';
import {
	BaseAggregationResult,
	BaseReportIteratorResult,
	StatisticsReportAggregator,
} from '../aggregation/aggregate-reports.service';
@Injectable()
export class ComputeStatisticsService {
	logger = new Logger(ComputeStatisticsService.name);
	constructor(
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
		@InjectModel(Statistics.name)
		protected statModel: Model<StatisticsDocument>,
		@InjectModel(User.name) protected userModel: Model<UserDocument>,
		@InjectModel(Term.name) protected termModel: Model<TermDocument>,
		protected partnerResourceService: PartnerResourcesService,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
		private reportAggregator: StatisticsReportAggregator,
	) {}
	defaultCacheTTl = 10;
	private async getTerm(
		termFilter: FilterQuery<TermDocument> & {
			resource_id: string;
			activity_term: string;
			league: string;
		},
	): Promise<TermDocument> {
		const { resource_id, activity_term, league } = termFilter;
		const getTermKey = (
			resource_id: string,
			activity_term: string,
			league: string,
		) => `term: ${resource_id}:${activity_term}:${league}`;
		const termKey = getTermKey(
			termFilter.resource_id,
			termFilter.activity_term,
			termFilter.league,
		);
		const cachedTerm = (await this.cacheManager.get(
			termKey,
		)) as TermDocument | null;
		if (cachedTerm) {
			return cachedTerm;
		}

		const terms = await this.termModel.find({ resource_id });
		let resultTerm: TermDocument | null = null;

		const cacheEvents$ = [];
		for (const term of terms) {
			if (term.activity_term == activity_term && term.league == league) {
				resultTerm = term;
			}
			const cacheEvent$ = this.cacheManager.set(
				getTermKey(resource_id, term.activity_term, term.league),
				term,
				this.defaultCacheTTl,
			);
			cacheEvents$.push(cacheEvent$);
		}
		await Promise.all(cacheEvents$);
		if (!resultTerm) {
			throw new Error(
				`Term ${activity_term} from resource ${resource_id} not found`,
			);
		}

		return resultTerm;
	}

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
		this.logger.debug('Upserting stat by report', report);
		const { resource_id, curator_orcid, activity_term, league } = report;
		const reportCount = report.count ?? 1;

		if (!reportCount) {
			this.logger.error(
				'ReportCount was found null or undefined' + reportCount,
			);
		}

		const term = await this.getTerm(this.getRelatedTermFilter(report));
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

	async getResourceTerms(
		resource_id: string,
	): Promise<Map<string, LeanDocument<Term>>> {
		const terms = await this.termModel.find({ resource_id }).lean();
		const termsMap = new Map<string, LeanDocument<Term>>();
		terms.forEach((term) => {
			termsMap.set(`${term.league}:${term.activity_term}`, term);
		});
		return termsMap;
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
		{
			resource,
			report,
			user,
			term,
		}: BaseReportIteratorResult<BaseAggregationResult>,
	) {
		computePrivacyField(resource, user, stat);
		const activity_category = term.activity_category;
		const score = term.score;
		stat[`${activity_category}_count`] += report.count;
		stat[`${activity_category}_score`] += report.count * score;
		if (!stat[`${activity_category}_terms`]) {
			stat[`${activity_category}_terms`] = [];
		}
		stat[`${activity_category}_terms`].push({
			activity_category: term.activity_category,
			activity_name: term.activity_name,
			description: term.description,
			activity_term: report.activity_term,
			count: report.count,
			score: score,
			sum: report.count * score,
		});

		stat.total_count += report.count;
		stat.total_score += report.count * score;
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
		for await (const { resource, report, user, term } of reportsByTerms) {
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

			this.updateSingleStat(currentStat, { resource, report, user, term });
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

		const term$ = this.getTerm(this.getRelatedTermFilter(report)).then(
			(term) => term.toObject() as LeanDocument<TermDocument>,
		);
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
		});
		stat.privacy = computePrivacyField(resource, user, stat);

		await stat.save();
	}
}
