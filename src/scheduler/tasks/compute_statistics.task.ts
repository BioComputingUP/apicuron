import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Aggregate, Model } from 'mongoose';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { PartnerResourcesService } from '../../resources/partner-resources/partner-resources.service';
import { TaskArgument } from '../../scheduler-client/types/baseTask';
import {
	Statistics,
	StatisticsDocument,
} from '../../core/schemas/statistics.schema';
import { StatisticsTerms } from '../../core/schemas/statistics-terms.schema';
import { Badge, BadgeDocument } from '../../core/schemas/badges.schema';
import { Medal, MedalDocument } from '../../core/schemas/medals.schema';
import { User, UserDocument } from '../../core/schemas/user.schema';
import { OnEvent } from '@nestjs/event-emitter';
import { PartnerResourceDocument } from 'src/core/schemas/resource.schema';
import {
	COMPUTE_CURATOR_STATISTICS_TASK,
	COMPUTE_RESOURCE_STATISTICS_TASK,
} from '../contants';

@Injectable()
export class ComputeStatisticsTask {
	constructor(
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
		@InjectModel(Statistics.name)
		protected statModel: Model<StatisticsDocument>,
		@InjectModel(Badge.name) protected badgeModel: Model<BadgeDocument>,
		@InjectModel(Medal.name) protected medalModel: Model<MedalDocument>,
		@InjectModel(User.name) protected userModel: Model<UserDocument>,
		protected partnerResourceService: PartnerResourcesService,
	) {}

	logger = new Logger(ComputeStatisticsTask.name);

	public async run_task(task_arg: TaskArgument) {
		if (task_arg.logLevel) {
			this.logger.localInstance.setLogLevels(task_arg.logLevel);
		}
		const [resource_id, orcid_id] = task_arg.arguments;

		const resource = await this.partnerResourceService.get_resource(
			resource_id,
		);

		if (!resource) {
			this.logger.error(`Resource ${resource_id} not found ! Aborting`);
			return;
		}
		if (orcid_id) {
			const user = await this.userModel.findOne({ orcid_id });
			if (user) {
				await this.compute_user_statistics({ resource, user });
				return;
			} else {
				this.logger.error(`User ${orcid_id} not found ! Aborting`);
			}
		}
		await this.compute_resource_statistics(resource);
	}

	@OnEvent(COMPUTE_RESOURCE_STATISTICS_TASK, { async: true })
	async compute_resource_statistics({ resource_id }: { resource_id: string }) {
		const { resource_uri } = await this.partnerResourceService.get_resource(
			resource_id,
		);
		const users_reports = this.group_resource_reports_by_terms(resource_id);

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
				privacy:
					(await this.userModel.findOne({ curator_orcid })).privacy ||
					'private',
				// type: 'contribution'
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

	private group_resource_reports_by_terms(
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

	@OnEvent(COMPUTE_CURATOR_STATISTICS_TASK, { async: true })
	async compute_user_statistics(payload: {
		resource: PartnerResourceDocument;
		user: UserDocument;
	}) {
		const {
			resource: { resource_id, resource_uri },
			user: { orcid_id },
		} = payload;

		const user_reports = this.group_user_reports_by_terms(
			resource_id,
			orcid_id,
		);

		const userPrivacy =
			(await this.userModel.findOne({ orcid_id })).privacy || 'private';

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

	private group_user_reports_by_terms(resource_id: string, orcid_id: string) {
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
}
