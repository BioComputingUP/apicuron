import { Inject, Injectable, Logger } from '@nestjs/common';
import { PartnerResourcesService } from '../../resources/partner-resources/partner-resources.service';
import {
	Medal,
	MedalDocument,
} from '../../core/schemas/achievements/medals.schema';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../core/schemas/user.schema';
import { Cursor, FilterQuery, Model } from 'mongoose';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import {
	MedalDef,
	MedalDefDocument,
} from '../../core/schemas/achievements-def/medal-def.schema';
import { Term, TermDocument } from '../../core/schemas/terms.schema';
import 'mongodb';
import { AchievementState } from '../../core/enums';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { UpdateResult, MongoServerError } from 'mongodb';
import { computePrivacyField } from '../../util/privacy.helper';
import { AggregatedReportsByMedalDef } from '../types/aggregated-reports';
import { PartnerResourceDocument } from '../../core/schemas/resource/partner-resource.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { onMedalsCompute } from '../events/events';
@Injectable()
export class ComputeMedalsService {
	constructor(
		@InjectModel(Medal.name) protected medalModel: Model<MedalDocument>,
		protected partnerResourceService: PartnerResourcesService,
		@InjectModel(User.name) protected userModel: Model<UserDocument>,
		@InjectModel(MedalDef.name) private medalDefModel: Model<MedalDefDocument>,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
		@InjectModel(Term.name) protected termModel: Model<TermDocument>,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
		private readonly eventEmitter: EventEmitter2,
	) {}

	logger = new Logger(ComputeMedalsService.name);
	defaultCacheTTL = 5;

	async computeResourceMedals({
		resource_id,
	}: {
		resource_id: string;
	}): Promise<number> {
		const medalsComputeCount = await this.computeMedals({ resource_id });

		return medalsComputeCount;
	}

	/**
	 * Builds a report filter based on the given medal criteria.
	 * @param medal - The medal definition to match against reports.
	 * @returns The filter query object for matching related reports.
	 */
	private matchRelatedReports(
		medal: MedalDefDocument,
	): FilterQuery<ReportDocument> {
		// first we first filter all the reports by the resource
		// and the terms that are concerned by the medals
		const reportFilter: FilterQuery<ReportDocument> = {
			resource_id: medal.resource_id,
			activity_term: {
				$in: medal.list_terms,
			},
			league: medal.league,
		};

		// if the medal has a time constraint we make sure it's added to the filter
		if (medal.first_day) {
			reportFilter['timestamp'] = { $gte: medal.first_day };
		}

		if (medal.last_day) {
			// if the timestamp object doesn't exist, it is created otherwise it is updated
			if (!reportFilter['timestamp']) {
				reportFilter['timestamp'] = { $lte: medal.last_day };
			} else {
				reportFilter['timestamp'] = {
					...reportFilter['timestamp'],
					$lte: medal.last_day,
				};
			}
		}

		return reportFilter;
	}

	/**
	 * Retrieves a cursor for aggregating medal reports.
	 *
	 * @param medal - The medal definition document.
	 * @param cursorOptions - The options for the cursor (default: { batchSize: 50 }).
	 * @returns A cursor for aggregating reports by medal definition.
	 */
	private medalReportsAggregationCursor(
		medal: MedalDefDocument,
		cursorOptions: { batchSize: number } = { batchSize: 50 },
	): Cursor<AggregatedReportsByMedalDef> {
		const reportFilter = this.matchRelatedReports(medal);

		return (
			this.reportModel
				.aggregate()
				.match(reportFilter)
				// # here we lookup and unwind from the terms_def collection to get the term score
				.lookup({
					from: this.termModel.collection.name,
					localField: 'activity_term',
					foreignField: 'activity_term',
					as: 'term',
				})
				.unwind({ path: '$term' })
				.project({
					curator_orcid: 1,
					activity_term: 1,
					score: '$term.score',
					resource_id: 1,
				})
				// # here we group by curator while computing the count and score sum
				.group({
					_id: '$curator_orcid',
					curator_orcid: {
						$first: '$curator_orcid',
					},
					activity_terms: {
						$addToSet: '$activity_term',
					},
					resource_id: {
						$first: '$resource_id',
					},
					count: {
						$sum: 1,
					},
					score_total: {
						$sum: '$score',
					},
				})
				// and we sort the output in decreasing order based on the score_total
				.sort({
					score_total: -1,
				})
				.cursor(cursorOptions)
		);
	}

	/**
	 * Computes the medals based on the given Medal Definition filter.
	 * Returns the number of medals Earned that were computed.
	 *
	 * @param medalDefFilter The filter to apply on the MedalDefDocument.
	 * @returns A promise that resolves to 0 when all medals are computed.
	 */
	async computeMedals(
		medalDefFilter: FilterQuery<MedalDefDocument> = {},
	): Promise<number> {
		await this.medalModel.deleteMany(medalDefFilter);

		const medalDefs = this.medalDefModel
			.find(medalDefFilter)
			.cursor({ batchSize: 50 });
		const medalPromises$ = [];
		for await (const medalDef of medalDefs) {
			const medalPromise$ = this.computeMedalsForMedalDef(medalDef);
			medalPromises$.push(medalPromise$);
		}
		const counts = await Promise.all(medalPromises$);
		this.logger.debug(`Computed ${counts.length} medals`);

		await this.eventEmitter.emitAsync(onMedalsCompute, medalDefFilter);

		return counts.reduce((acc, val) => acc + val, 0);
	}

	/**
	 * Retrieves a resource by its ID.
	 * If the resource is found in the cache, it is returned from there.
	 * Otherwise, it is fetched from the partner resource service and stored in the cache for future use.
	 * @param resource_id The ID of the resource to retrieve.
	 * @returns The retrieved resource.
	 */
	private async getResource(resource_id: string) {
		const getResourceCacheKey = (resource_id: string) =>
			`resource:${resource_id}`;
		const key = getResourceCacheKey(resource_id);
		const cachedResource = (await this.cacheManager.get(
			key,
		)) as PartnerResourceDocument;
		if (cachedResource) {
			return cachedResource;
		}
		const resource = await this.partnerResourceService.get_resource(
			resource_id,
		);
		await this.cacheManager.set(
			getResourceCacheKey(resource_id),
			resource,
			this.defaultCacheTTL,
		);
		return resource;
	}

	/**
	 * Retrieves a user from the cache or the database based on the provided ORCID ID.
	 * If the user is found in the cache, it is returned immediately.
	 * Otherwise, the user is fetched from the database, stored in the cache, and returned.
	 * @param orcid_id The ORCID ID of the user to retrieve.
	 * @returns The user document if found, otherwise null.
	 */
	private async getUser(orcid_id: string): Promise<UserDocument | null> {
		const getUserCacheKey = (orcid_id: string) => `user:${orcid_id}`;
		const cachedUser = (await this.cacheManager.get(
			getUserCacheKey(orcid_id),
		)) as UserDocument;
		if (cachedUser) {
			return cachedUser;
		}
		const user = await this.userModel.findOne({ orcid_id });
		await this.cacheManager.set(
			getUserCacheKey(orcid_id),
			user,
			this.defaultCacheTTL,
		);
		return user;
	}

	private async computeMedalsForMedalDef(medalDef: MedalDefDocument) {
		const reportsAgg = this.medalReportsAggregationCursor(medalDef);

		const medalAsyncIterator = (async function* () {
			let i = 0;
			for await (const reportWithCount of reportsAgg) {
				yield [reportWithCount, i] as [AggregatedReportsByMedalDef, number];
				i++;
			}
			return;
		})();

		const aggReportsPromises$: Promise<number>[] = [];

		for await (const [aggregatedReports, idx] of medalAsyncIterator) {
			const aggReportsPromise$ = this.processAggregatedReportsByMedalDef(
				medalDef,
				aggregatedReports,
				idx,
			);
			aggReportsPromises$.push(aggReportsPromise$);
		}

		const counts = await Promise.all(aggReportsPromises$);
		const count = counts.reduce((acc, val) => acc + val, 0);
		this.logger.debug(`Computed ${count} medals for ${medalDef.name}`);
		return count;
	}

	/**
	 * Creates Medals by processing aggregated reports filtered by medal definition.
	 *
	 * @param medalDef - The medal definition document.
	 * @param aggregatedReports - The aggregated reports by medal definition.
	 * @param resource - The partner resource document.
	 * @param rankIndex - The rank index.
	 * @returns The number of earned medals.
	 */
	private async processAggregatedReportsByMedalDef(
		medalDef: MedalDefDocument,
		aggregatedReports: AggregatedReportsByMedalDef,
		rankIndex: number,
	): Promise<number> {
		let earnedMedalsCount = 0;
		const earned = rankIndex + 1 >= medalDef.score_relative;

		const medal = new this.medalModel({
			...medalDef.toObject(),
			_id: undefined,
			curator_orcid: aggregatedReports.curator_orcid,
			count_total: aggregatedReports.count,
			score_total: aggregatedReports.score_total,
			state: earned ? AchievementState.progress : AchievementState.achieved,
			score_relative_valid: earned,
			score_relative_index: rankIndex,
		});
		earnedMedalsCount += earned ? 1 : 0;
		const user = await this.getUser(aggregatedReports.curator_orcid);
		const resource = await this.getResource(medalDef.resource_id);
		computePrivacyField(resource, user, medal);

		try {
			await medal.save();
			this.logger.debug(
				`Saved medal ${medalDef.name} for ${aggregatedReports.curator_orcid} earnedMedalsCount: ${earnedMedalsCount}`,
			);
			return earnedMedalsCount;
		} catch (err) {
			if (err instanceof Error) {
				this.logger.error(err.message, err.stack, err.name);
				throw new Error(
					`An error occured while creating medal ${medalDef.name} for curator ${aggregatedReports.curator_orcid} in resource ${medalDef.resource_id}`,
				);
			}
		}
	}

	// Unsafe method
	private async upsertMedalForReport(
		medalDef: MedalDefDocument,
		report: ReportDocument & { count?: 1 },
		term: TermDocument,
	): Promise<UpdateResult> {
		const { resource_id, curator_orcid } = report;
		const reportCount = report.count ?? 1;
		const medalFilter = {
			curator_orcid: curator_orcid,
			resource_id: resource_id,
			name: medalDef.name,
			league: medalDef.league,
		};
		delete medalDef._id;
		try {
			return await this.medalModel.updateOne(
				medalFilter,
				[
					{
						$set: {
							...medalDef.toObject(),
							curator_orcid: report.curator_orcid,
							count_total: {
								$cond: [
									{
										$eq: ['$count_total', null],
									},
									reportCount,
									{
										$add: ['$count_total', reportCount],
									},
								],
							},
							score_total: {
								$cond: [
									{
										$eq: ['$score_total', null],
									},
									term.score * reportCount,
									{
										$add: ['$score_total', term.score * reportCount],
									},
								],
							},
						},
					},
				],
				{
					upsert: true,
				},
			);
		} catch (err: any) {
			if (err instanceof MongoServerError && err.code && err.code === 11000) {
				this.logger.debug(
					`Medal ${medalDef.name} already exists for curator ${curator_orcid}`,
				);

				return await this.medalModel.updateOne(medalFilter, [
					{
						$set: {
							count_total: {
								$cond: [
									{
										$eq: ['$count_total', null],
									},
									reportCount,
									{
										$add: ['$count_total', reportCount],
									},
								],
							},
							score_total: {
								$cond: [
									{
										$eq: ['$score_total', null],
									},
									term.score * reportCount,
									{
										$add: ['$score_total', term.score * reportCount],
									},
								],
							},
						},
					},
				]);
			}
			if (err instanceof Error) {
				this.logger.error(err.message, err.stack, err.name);
				throw new Error(
					`An error occured while upserting medal ${medalDef.name} for curator ${curator_orcid} in resource ${resource_id}`,
				);
			}
		}
	}

	private async updateMedalsEarnedState(
		medalDef: MedalDefDocument,
	): Promise<number> {
		const earnedMedalsList = await this.medalModel
			.find(
				{
					name: medalDef.name,
					resource_id: medalDef.resource_id,
					league: medalDef.league,
				},
				{},
				{ sort: { score_total: -1 } },
			)
			.limit(medalDef.score_relative);

		if (earnedMedalsList.length === 0) {
			this.logger.debug(
				`No medals earned for ${medalDef.name} for resource ${medalDef.resource_id}`,
			);
			return 0;
		}

		const lowestMedalEarned: MedalDocument =
			earnedMedalsList[earnedMedalsList.length - 1];

		this.logger.debug(
			`Lowest Medal (${lowestMedalEarned.name}) Earned is by ${lowestMedalEarned.curator_orcid} has score ${lowestMedalEarned.score_total}`,
		);

		// update all medals that are lower than the lowest medal earned
		const updateLower = this.medalModel.updateMany(
			{
				name: medalDef.name,
				resource_id: medalDef.resource_id,
				league: medalDef.league,
				score_total: { $lt: lowestMedalEarned.score_total },
			},
			{ $set: { state: AchievementState.progress } },
		);

		// update all medals that are higher than the lowest medal earned

		const updateEarnedPromises$ = earnedMedalsList.map(async (medal, idx) => {
			medal.state = AchievementState.achieved;
			medal.score_relative_index = idx;

			return await medal.save();
		});
		const updateEearned$ = Promise.all(updateEarnedPromises$);

		const [, higherUpdate] = await Promise.all([updateLower, updateEearned$]);

		this.logger.debug(
			`Medal ${medalDef.name} earned by ${higherUpdate.length} curators`,
		);

		return higherUpdate.length;
	}

	private async getTerm({ resource_id, activity_term, league }) {
		const getTermKey = ({ resource_id, activity_term, league }) =>
			`term:${resource_id}:${activity_term}:${league}`;

		const cachedTerm = (await this.cacheManager.get(
			getTermKey({ resource_id, activity_term, league }),
		)) as TermDocument;

		if (!cachedTerm) {
			const term = await this.termModel.findOne({
				resource_id,
				activity_term,
				league,
			});

			await this.cacheManager.set(
				getTermKey({ resource_id, activity_term, league }),
				term,
				this.defaultCacheTTL,
			);
			return term;
		}

		return cachedTerm;
	}

	async incrementalMedalCompute(report: ReportDocument) {
		const { resource_id, activity_term, league } = report;
		const term = await this.getTerm({
			resource_id: resource_id,
			activity_term: activity_term,
			league,
		});

		const concernedMedalDefs = await this.medalDefModel.find({
			list_terms: activity_term,
			resource_id: resource_id,
			league: league,
			first_day: { $lte: report.timestamp },
			last_day: { $gte: report.timestamp },
		});

		const medalupdates$ = concernedMedalDefs.map(async (medalDef) => {
			return await this.upsertMedalForReport(medalDef, report, term);
		});

		await Promise.all(medalupdates$);

		// for each concerned medalDef
		const computeEarnedMedals$ = concernedMedalDefs.map(
			async (medalDef: MedalDefDocument) => {
				// get the lowest medal that is earned
				return await this.updateMedalsEarnedState(medalDef);
			},
		);

		await Promise.all(computeEarnedMedals$);
	}
}
