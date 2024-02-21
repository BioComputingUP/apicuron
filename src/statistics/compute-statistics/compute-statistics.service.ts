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
import { PartnerResourceDocument } from '../../core/schemas/resource/partner-resource.schema';
import { computePrivacyField } from '../../util/privacy.helper';
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
	) {}
	defaultCacheTTl = 10;
	private async getTerm(
		termFilter: FilterQuery<TermDocument>,
	): Promise<TermDocument> {
		const { resource_id, activity_term, league } = termFilter;
		const termCacheKey = `term: ${resource_id}:${activity_term}:${league}`;
		const cachedTerm = (await this.cacheManager.get(
			termCacheKey,
		)) as TermDocument | null;
		if (cachedTerm) {
			return cachedTerm;
		}

		const term = await this.termModel.findOne({ resource_id, activity_term });
		await this.cacheManager.set(termCacheKey, term, this.defaultCacheTTl);
		return term;
	}

	private getRelatedStatsFilter(
		report: ReportDocument | Report | LeanDocument<Report>,
	): FilterQuery<StatisticsDocument> {
		const { curator_orcid, resource_id, league } = report;
		return {
			curator_orcid,
			resource_id,
			league: league,
		};
	}

	private getRelatedTermFilter(
		report: ReportDocument | Report | LeanDocument<Report>,
	): FilterQuery<TermDocument> {
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
					$count: {},
				},
			})
			.sort({
				resource_id: -1,
				curator_orcid: -1,
				ActivityClass: -1,
			});
	}

	/**
	 * Computes statistics based on the provided filter.
	 * @param filter - The filter query to apply when fetching reports.
	 * @returns {Promise<void>} - A promise that resolves when the statistics computation is complete.
	 */
	async computeStatistics(filter: FilterQuery<ReportDocument> = {}) {
		const statFilter = this.getRelatedStatsFilter(new this.reportModel(filter));
		await this.statModel.deleteMany(statFilter);
		const reportsByTerms = this.aggregateReportsByActivity(filter).cursor({
			batchSize: 100,
		});

		let currentStat: StatisticsDocument | null = null;
		let currentResource: PartnerResourceDocument | null = null;
		let currentUser: UserDocument | null = null;
		let current_terms: Map<string, LeanDocument<Term>> = new Map();

		const statSaves$ = [];

		for await (const report of reportsByTerms) {
			const relatedStat = this.getRelatedStatsFilter(report);

			if (!currentStat) {
				// instantiate a new stat object if the current stat is null
				currentStat = new this.statModel(relatedStat);
			}
			if (!this.reportIsRelatedToStat(report, currentStat)) {
				if (!currentResource) {
					throw new Error('Derna diga');
				}

				computePrivacyField(currentResource, currentUser, currentStat);

				const statSavePromise$ = currentStat.save();
				statSaves$.push(statSavePromise$);
				currentStat = new this.statModel(relatedStat);
			}

			if (
				!currentResource ||
				currentResource.resource_id !== report.resource_id
			) {
				const resource$ = this.partnerResourceService.get_resource(
					report.resource_id,
				);
				const terms$ = this.getResourceTerms(report.resource_id);
				[currentResource, current_terms] = await Promise.all([
					resource$,
					terms$,
				]);
			}

			if (!currentUser || currentUser.orcid_id !== report.curator_orcid) {
				currentUser = await this.userModel.findOne({
					orcid_id: report.curator_orcid,
				});
			}

			const term = current_terms.get(
				report.league + ':' + report.activity_term,
			);
			const { activity_category, score } = term;

			currentStat[`${activity_category}_count`] += report.count;
			currentStat[`${activity_category}_score`] += report.count * score;
			if (!currentStat[`${activity_category}_terms`]) {
				currentStat[`${activity_category}_terms`] = [];
			}
			currentStat[`${activity_category}_terms`].push({
				...term,
				count: report.count,
				curator_orcid: currentStat.curator_orcid,
				sum: report.count * score,
			});

			currentStat.total_count += report.count;
			currentStat.total_score += report.count * score;
		}

		await Promise.all(statSaves$);
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
