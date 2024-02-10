import { Inject, Injectable, Logger } from '@nestjs/common';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../core/schemas/user.schema';
import {
	Statistics,
	StatisticsDocument,
} from '../../core/schemas/statistics.schema';
import { PartnerResourcesService } from '../../resources/partner-resources/partner-resources.service';
import { Aggregate, FilterQuery, Model, UpdateWriteOpResult } from 'mongoose';
import { MongoServerError } from 'mongodb';
// import { StatisticsTerms } from '../../core/schemas/statistics-terms.schema';
// import {
// 	ON_COMPUTE_RESOURCE_ACHIEVEMENTS,
// 	ON_COMPUTE_USER_ACHIEVEMENTS,
// } from '../../achievements/constants';
import { Term, TermDocument } from '../../core/schemas/terms.schema';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import * as _ from 'lodash';
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

	private async retrieveTerm({
		resource_id,
		activity_term,
	}: {
		resource_id: string;
		activity_term: string;
	}): Promise<Term> {
		const cacheId = `term: ${resource_id}:${activity_term}`;
		const cached = (await this.cacheManager.get(cacheId)) as Term | null;
		if (cached) {
			return cached;
		}

		const term = await this.termModel.findOne({ resource_id, activity_term });
		await this.cacheManager.set(cacheId, term);
		return term;
	}

	// async updateStatByReport(
	// 	report: ReportDocument,
	// ): Promise<UpdateWriteOpResult> {
	// 	const { resource_id, curator_orcid, activity_term } = report;

	// 	const term = await this.retrieveTerm({ resource_id, activity_term });
	// 	if (!term) {
	// 		this.logger.warn(
	// 			`Warning, report found with term ${activity_term} but no corresponding term was found, deleting report`,
	// 		);

	// 		await this.reportModel.deleteMany({
	// 			activity_term: report.activity_term,
	// 		});
	// 		return {
	// 			upsertedCount: 0,
	// 			upsertedId: null,
	// 			modifiedCount: 0,
	// 			acknowledged: false,
	// 			matchedCount: 0,
	// 		};
	// 	}

	// 	const activityClass = report.activityClass;

	// 	try {
	// 		const updateResponse = await this.statModel.updateOne(
	// 			// const updateResponse = await this.statModel.findOneAndUpdate(
	// 			{
	// 				curator_orcid,
	// 				resource_id,
	// 				activityClass: activityClass,
	// 			},
	// 			{
	// 				$setOnInsert: {
	// 					curator_orcid,
	// 					resource_id,
	// 					activityClass: activityClass,
	// 				},
	// 				$inc: {
	// 					[term.activity_category + '_count']: 1,
	// 					[term.activity_category + '_score']: term.score,
	// 					total_score: term.score,
	// 					total_count: 1,
	// 				},
	// 			},
	// 			{
	// 				upsert: true,
	// 			},
	// 		);

	// 		return updateResponse;
	// 	} catch (err: any) {
	// 		if (!(err instanceof MongoServerError) || err.code != 11000) {
	// 			this.logger.error(err.message, err.stack, err.name);
	// 			throw new Error(
	// 				`Failed to update statistics for user: ${curator_orcid} at the resource ${resource_id} `,
	// 			);
	// 		}
	// 		this.logger.verbose('Error upserting document update, attempt to update');

	// 		const updateResponse = await this.statModel.updateOne(
	// 			{
	// 				curator_orcid,
	// 				resource_id,
	// 				activityClass: activityClass,
	// 			},
	// 			{
	// 				$inc: {
	// 					[term.activity_category + '_count']: 1,
	// 					[term.activity_category + '_score']: term.score,
	// 					total_score: term.score,
	// 					total_count: 1,
	// 				},
	// 			},
	// 		);

	// 		return updateResponse;
	// 	}
	// }

	// async testComputeStats() {
	// 	await this.statModel.deleteMany({});
	// 	const reports$ = this.reportModel.find({}, { batchSize: 100 });

	// 	const promises$ = [];

	// 	for await (const report of reports$) {
	// 		const promise = this.updateStatByReport(report);
	// 		promises$.push(promise);
	// 	}

	// 	await Promise.all(promises$);
	// }

	async computeStatistics(filter: FilterQuery<ReportDocument> = {}) {
		await this.statModel.deleteMany({});
		const reportsByTerms: Aggregate<
			{
				resource_id: string;
				curator_orcid: string;
				activity_term: string;
				count;
				number;
			}[]
		> = this.reportModel
			.aggregate()
			.match(filter)
			.group({
				_id: {
					resource_id: '$resource_id',
					curator_orcid: '$curator_orcid',
					activityClass: '$activityClass',
					activity_term: '$activity_term',
				},
				resource_id: {
					$first: '$resource_id',
				},
				curator_orcid: {
					$first: '$curator_orcid',
				},
				activityClass: {
					$first: '$activityClass',
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

		const identifierFields: readonly string[] = [
			'resource_id',
			'curator_orcid',
			'activityClass',
		] as const;

		let current_terms = new Map<string, TermDocument>();
		let currentStat: null | StatisticsDocument = null;
		for await (const report of reportsByTerms) {
			const reportIdentifiers = _.pick(report, identifierFields);
			if (!currentStat) {
				current_terms = new Map(
					(
						await this.termModel.find({
							resource_id: reportIdentifiers.resource_id,
						})
					).map((term: TermDocument) => [term.activity_term, term]),
				);
				currentStat = new this.statModel(reportIdentifiers);
			}

			const currentStatIdentifiers = _.pick(
				currentStat.toObject(),
				identifierFields,
			);
			this.logger.debug(
				`isEqual output ${_.isEqual(
					currentStatIdentifiers,
					reportIdentifiers,
				)}`,
			);
			if (!_.isEqual(currentStatIdentifiers, reportIdentifiers)) {
				try {
					await currentStat.save();
				} catch (e: any) {
					this.logger.error('Failed to save stat');
					this.logger.error(currentStat);
					this.logger.error('Objects Comparison');
					this.logger.error({ currentStatIdentifiers, reportIdentifiers });
					throw new Error(e);
				}
				currentStat = new this.statModel(reportIdentifiers);
				if (
					currentStatIdentifiers.resource_id != reportIdentifiers.resource_id
				) {
					current_terms = new Map(
						(
							await this.termModel.find({
								resource_id: reportIdentifiers.resource_id,
							})
						).map((term: TermDocument) => [term.activity_term, term]),
					);
				}
			}

			const term = current_terms.get(report.activity_term);
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
		}
	}

	// events handling

	// @OnEvent(ON_ACHIEVEMENTS_UPDATE, { async: true})
	// async onAchievementsUpdate({ resource_id: string, curator_orcid: string}){
	// 	this.statModel.updateMany({
	// 		resource_id,
	// 		curator_orcid
	// 	}, {
	// 		$set: {
	// 			badges_count: this.badgeModel.
	// 		}
	// 	})
	// }

	// 	@OnEvent(ON_COMPUTE_RESOURCE_ACHIEVEMENTS, { async: true })
	// 	async onComputeResourceAchievements({
	// 		resource_id,
	// 	}: {
	// 		resource_id: string;
	// 	}) {
	// 		return await this.computeResourceStatistics({ resource_id });
	// 	}

	// 	@OnEvent(ON_COMPUTE_USER_ACHIEVEMENTS, { async: true })
	// 	async onComputeUserAchievements({
	// 		resource,
	// 		user,
	// 	}: {
	// 		resource: { resource_id: string };
	// 		user: { orcid_id: string };
	// 	}) {
	// 		return await this.computeUserStatistics({ resource, user });
	// 	}
}
