import { Inject, Injectable, Logger } from '@nestjs/common';
import { Report, ReportDocument } from '../core/schemas/reports.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Badge, BadgeDocument } from '../core/schemas/badges.schema';
import { Medal, MedalDocument } from '../core/schemas/medals.schema';
import { User, UserDocument } from '../core/schemas/user.schema';
import {
	Statistics,
	StatisticsDocument,
} from '../core/schemas/statistics.schema';
import { PartnerResourcesService } from '../resources/partner-resources/partner-resources.service';
import { Aggregate, FilterQuery, Model } from 'mongoose';
import { OnEvent } from '@nestjs/event-emitter';
import { StatisticsTerms } from '../core/schemas/statistics-terms.schema';
import {
	ON_COMPUTE_RESOURCE_ACHIEVEMENTS,
	ON_COMPUTE_USER_ACHIEVEMENTS,
} from '../achievements/constants';
import { Term, TermDocument } from '../core/schemas/terms.schema';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import {
	ContributionType,
	PrivacyType,
} from '../core/schemas/activity-category.schema';
@Injectable()
export class ComputeStatisticsService {
	logger = new Logger(ComputeStatisticsService.name);
	constructor(
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
		@InjectModel(Statistics.name)
		protected statModel: Model<StatisticsDocument>,
		@InjectModel(Badge.name) protected badgeModel: Model<BadgeDocument>,
		@InjectModel(Medal.name) protected medalModel: Model<MedalDocument>,
		@InjectModel(User.name) protected userModel: Model<UserDocument>,
		@InjectModel(Term.name) protected termModel: Model<TermDocument>,
		protected partnerResourceService: PartnerResourcesService,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	async computeResourceStatistics({ resource_id }: { resource_id: string }) {
		const { resource_uri } = await this.partnerResourceService.get_resource(
			resource_id,
		);
		const users_reports = this.groupResourceReportsByTerms(resource_id);

		const deletion_response = await this.statModel.deleteMany({ resource_id });
		this.logger.log(
			`Deleted ${deletion_response.deletedCount} statistics for resource ${resource_id}`,
		);

		const updates_promises = [];

		let ranking = 0;
		for await (const user_report of users_reports) {
			const curator_orcid = user_report._id;
			ranking++;
			// for each term we compute the total sum of scores multiplied by their count
			for (let i = 0; i < user_report['terms'].length; i++) {
				const term = user_report['terms'][i];
				user_report['terms'][i]['sum'] = term['score'] * term['count'];
			}

			const generation_terms: StatisticsTerms[] = user_report.terms.filter(
				(term) => term.activity_category == 'generation',
			);
			const revision_terms: StatisticsTerms[] = user_report.terms.filter(
				(term) => term.activity_category == 'revision',
			);
			const invalidation_terms: StatisticsTerms[] = user_report.terms.filter(
				(term) => term.activity_category == 'invalidation',
			);
			// terms counts
			const generation_count = generation_terms.reduce(
				(prev, curr) => prev + curr.count,
				0,
			);
			const revision_count = revision_terms.reduce(
				(prev, curr) => prev + curr.count,
				0,
			);
			const invalidation_count = invalidation_terms.reduce(
				(prev, curr) => prev + curr.count,
				0,
			);

			// terms scores sums
			const generation_score = generation_terms.reduce(
				(prev, curr) => prev + curr['sum'],
				0,
			);
			const revision_score = revision_terms.reduce(
				(prev, curr) => prev + curr['sum'],
				0,
			);
			const invalidation_score = invalidation_terms.reduce(
				(prev, curr) => prev + curr['sum'],
				0,
			);

			const privacy: PrivacyType =
				(await this.userModel.findOne({ orcid_id: curator_orcid }))?.privacy ||
				PrivacyType.private;

			this.logger.debug(
				`User ${curator_orcid} has privacy set as "${privacy}"`,
			);

			const stat_entry: Statistics = {
				curator_orcid,
				resource_id,
				resource_uri,
				total_score: user_report['total_score'],
				generation_terms,
				revision_terms,
				invalidation_terms,
				generation_count,
				revision_count,
				invalidation_count,
				generation_score,
				revision_score,
				invalidation_score,
				ranking,
				total_count: generation_count + revision_count + invalidation_count,
				badges_count: await this.badgeModel.count({
					resource_id,
					curator_orcid,
				}),
				medals_count: await this.medalModel.count({
					resource_id,
					curator_orcid,
				}),
				privacy,
				contribution_type: ContributionType.community,
			};

			const update_promise = this.statModel.replaceOne(
				{ curator_orcid: user_report._id, resource_id },
				stat_entry,
				{ upsert: true },
			);
			updates_promises.push(update_promise);
		}

		await Promise.all(updates_promises);
		this.logger.log(`Computed ${updates_promises.length} users statistics`);
	}

	private async retrieveUser(curator_orcid: string): Promise<User> {
		const cached = (await this.cacheManager.get(curator_orcid)) as User | null;
		if (cached) {
			return cached;
		}

		const user = await this.userModel.findOne({ orcid_id: curator_orcid });
		await this.cacheManager.set(curator_orcid, user);
		return user;
	}

	private async retrieveTerm({
		resource_id,
		activity_term,
	}: {
		resource_id: string;
		activity_term: string;
	}): Promise<Term> {
		const cacheId = resource_id + ':' + activity_term;
		const cached = (await this.cacheManager.get(cacheId)) as Term | null;
		if (cached) {
			return cached;
		}

		const term = await this.termModel.findOne({ resource_id, activity_term });
		await this.cacheManager.set(cacheId, term);
		return term;
	}

	private async incrementalStatisticsCompute(report: Report) {
		const { resource_id, curator_orcid, contribution_type, activity_term } =
			report;

		const user = await this.retrieveUser(curator_orcid);

		const term = await this.retrieveTerm({ resource_id, activity_term });

		return await this.statModel.updateOne(
			{
				curator_orcid,
				resource_id,
				type: contribution_type,
				privacy: user.privacy,
			},
			{
				$set: {
					curator_orcid,
					resource_id,
					type: contribution_type,
					privacy: user.privacy,
				},
				$inc: {
					[term.activity_category + '_count']: 1,
					[term.activity_category + '_score']: term.score,
					total_score: term.score,
					total_count: 1,
				},
			},
			{ upsert: true },
		);
	}

	async computeStats(filter: FilterQuery<ReportDocument>) {
		this.cacheManager.reset();
		const commonFields = ['resource_id', 'type', 'privacy', 'curator_orcid'];

		const statFilter = Object.fromEntries(
			commonFields
				.filter((field) => !!filter[field])
				.map((field) => [field, filter[field]]),
		);

		// Deleting all previous Entries
		await this.statModel.deleteMany(statFilter);

		const reports = this.reportModel.find(filter);

		for await (const report of reports) {
			await this.incrementalStatisticsCompute(report);
		}
	}

	private groupResourceReportsByTerms(
		resource_id: string,
	): Aggregate<{ terms: any[]; total_score: number; _id: string }[]> {
		return this.reportModel
			.aggregate()
			.match({
				resource_id,
			})
			.group({
				_id: {
					curator_orcid: '$curator_orcid',
					activity_term: '$activity_term',
				},
				count: {
					$sum: 1,
				},
				curator_orcid: {
					$first: '$curator_orcid',
				},
				activity_term: {
					$first: '$activity_term',
				},
			})
			.lookup({
				from: 'terms_def',
				let: { term_id: '$activity_term' },
				// This is necessary to only uncover the terms from the specific resource
				pipeline: [
					{
						$match: {
							$expr: {
								$and: [
									{
										$eq: ['$resource_id', resource_id],
									},
									{
										$eq: ['$activity_term', '$$term_id'],
									},
								],
							},
						},
					},
				],
				as: 'term',
			})
			.unwind({
				path: '$term',
				preserveNullAndEmptyArrays: true,
			})
			.append({
				$set: {
					activity_category: '$term.activity_category',
					score: '$term.score',
					activity_name: '$term.activity_name',
					description: '$term.description',
				},
			})
			.group({
				_id: '$curator_orcid',
				terms: {
					$addToSet: {
						count: '$count',
						activity_term: '$activity_term',
						activity_category: '$activity_category',
						score: '$score',
						description: '$description',
						activity_name: '$activity_name',
					},
				},
				total_score: {
					$sum: { $multiply: ['$count', '$score'] },
				},
			})
			.sort({ total_score: -1 });
	}

	async computeUserStatistics(payload: {
		resource: { resource_id: string; resource_uri?: string };
		user: { orcid_id: string };
	}) {
		const {
			resource: { resource_id },
			user: { orcid_id },
		} = payload;

		let resource_uri: string;
		if (payload.resource.resource_uri) {
			resource_uri = payload.resource.resource_uri;
		} else {
			resource_uri = (
				await this.partnerResourceService.get_resource(resource_id)
			).resource_uri;
		}

		const user_reports = this.groupUserReportsByTerms(resource_id, orcid_id);

		const userPrivacy =
			(await this.userModel.findOne({ orcid_id }))?.privacy || 'private';

		const user_stats = {
			generation_terms: [],
			revision_terms: [],
			invalidation_terms: [],
			generation_count: 0,
			revision_count: 0,
			invalidation_count: 0,
			generation_score: 0,
			revision_score: 0,
			invalidation_score: 0,
			resource_id,
			curator_orcid: orcid_id,
			medals_count: 0,
			badges_count: 0,
			privacy: userPrivacy,
		};

		let reportCount = 0;

		for await (const report of user_reports) {
			const activity_category = report['activity_category'];

			user_stats[`${activity_category}_terms`].push({
				...report,
				resource_id,
				resource_uri,
			});
			user_stats[`${activity_category}_count`] += report['count'];
			user_stats[`${activity_category}_score`] += report['sum'];

			reportCount += 1;
		}

		this.logger.log(
			`User ${orcid_id} has ${reportCount} Reports for resource ${resource_id} !`,
		);

		['generation', 'invalidation', 'revision'].forEach((cat: string) => {
			this.logger.log(
				`User ${orcid_id} for resource ${resource_id} earned \n ${cat} score: ${
					user_stats[cat + '_score']
				} with ${user_stats[cat + '_count']} Contributions`,
			);
		});

		user_stats.medals_count = await this.medalModel.count({
			resource_id,
			curator_orcid: orcid_id,
		});
		user_stats.badges_count = await this.badgeModel.count({
			resource_id,
			curator_orcid: orcid_id,
		});

		return await this.statModel.updateOne(
			{
				curator_orcid: orcid_id,
				resource_id,
			},
			{ $set: user_stats },
			{ upsert: true },
		);
	}

	private groupUserReportsByTerms(resource_id: string, orcid_id: string) {
		return (
			this.reportModel
				.aggregate()
				// # only reports from user
				.match({
					curator_orcid: orcid_id,
					resource_id,
				})
				//  # lookup the terms to get the activity_category, name, description and score
				.lookup({
					from: 'terms_def',
					localField: 'activity_term',
					foreignField: 'activity_term',
					as: 'term',
				})
				.unwind({
					path: '$term',
					preserveNullAndEmptyArrays: true,
				})
				.append({
					$set: {
						activity_category: '$term.activity_category',
						score: '$term.score',
						activity_name: '$term.activity_name',
						description: '$term.description',
					},
				})
				// # after the lookup and cleaning the results
				// # we group the data by activity_terms
				// # and we compute the score sum and count of each activity_term
				.group({
					_id: '$activity_term',
					sum: {
						$sum: '$score',
					},
					score: {
						$first: '$score',
					},
					count: {
						$sum: 1,
					},
					activity_name: {
						$first: '$activity_name',
					},
					description: {
						$first: '$description',
					},
					activity_category: {
						$first: '$activity_category',
					},
				})
		);
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

	@OnEvent(ON_COMPUTE_RESOURCE_ACHIEVEMENTS, { async: true })
	async onComputeResourceAchievements({
		resource_id,
	}: {
		resource_id: string;
	}) {
		return await this.computeResourceStatistics({ resource_id });
	}

	@OnEvent(ON_COMPUTE_USER_ACHIEVEMENTS, { async: true })
	async onComputeUserAchievements({
		resource,
		user,
	}: {
		resource: { resource_id: string };
		user: { orcid_id: string };
	}) {
		return await this.computeUserStatistics({ resource, user });
	}
}
