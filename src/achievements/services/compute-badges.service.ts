import { Injectable, Logger } from '@nestjs/common';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { Cursor, FilterQuery, Model, UpdateQuery } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../core/schemas/user.schema';
import { Badge, BadgeDocument } from '../../core/schemas/badges.schema';
import { PartnerResourcesService } from '../../resources/partner-resources/partner-resources.service';
import { MongoServerError } from 'mongodb';
import {
	BadgeDef,
	BadgeDefDocument,
} from '../../core/schemas/badge-def.schema';
import {
	AchievementDef,
	AchievementDefDocument,
} from '../../core/schemas/achievement-def.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ON_BADGES_UPDATE, ON_USER_BADGES_UPDATE } from '../constants';
import { AchievementState } from '../../core/enums';
import { Achievement } from '../../core/schemas/achievements.schema';
import { cpSync } from 'fs';

@Injectable()
export class ComputeBadgesService {
	constructor(
		protected partnerResourceService: PartnerResourcesService,
		@InjectModel(User.name) protected userModel: Model<UserDocument>,
		@InjectModel(Badge.name) protected badgeModel: Model<BadgeDocument>,
		@InjectModel(AchievementDef.name)
		private achievementDefModel: Model<AchievementDefDocument>,
		@InjectModel(BadgeDef.name) private badgeDefModel: Model<BadgeDefDocument>,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
		protected eventEmitter: EventEmitter2,
	) {}

	logger = new Logger(ComputeBadgesService.name);

	public async computeResourceBadges(resource: { resource_id: string }) {
		const { resource_id } = resource;
		await this.badgeModel.deleteMany({ resource_id });

		const curators: Cursor<any, never> = this.reportModel
			.aggregate([
				{
					$group: {
						_id: '$curator_orcid',
					},
				},
			])
			.cursor();

		const userBadgesPromises: Promise<any>[] = [];

		await curators.eachAsync((doc) => {
			const orcid_id: string = doc._id;

			const badgeComputePromise = this.computeUserBadges({
				resource,
				user: { orcid_id },
			});
			userBadgesPromises.push(badgeComputePromise);
		});

		// const orcid_ids = curators.map((entry) => entry._id);

		// const userBadgesPromises = orcid_ids.map((orcid_id) => this.computeUserBadges(resource_id, orcid_id))

		return await Promise.all(userBadgesPromises);
	}

	public async computeUserBadges(payload: {
		resource: { resource_id: string };
		user: { orcid_id: string };
	}) {
		const {
			resource: { resource_id },
			user: { orcid_id: curator_orcid },
		} = payload;

		this.logger.debug(
			`Computing Badges for user ${curator_orcid} at resource ${resource_id}`,
		);

		// Iterate Over reports from the oldest to newest
		const userReportsIterator = this.reportModel
			.find(
				{ resource_id, curator_orcid },
				{},
				{ $sort: { timestamp: 1 }, batchSize: 100 },
			)
			.cursor();

		const userReportsAggregation = await this.reportModel
			.aggregate()
			.match({
				resource_id,
				curator_orcid,
			})
			.group({
				_id: {
					activity_term: '$activity_term',
					contribution_type: '$contribution_type',
				},
				curator_orcid: { $first: '$curator_orcid' },
				resource_id: { $first: '$resource_id' },
				activity_term: { $first: '$activity_term' },
				contribution_type: { $first: '$contribution_type' },
				count: {
					$count: {},
				},
			});

		const badgeDefs = await this.badgeDefModel.find({ resource_id });

		const badgeUpdatePromises = [];

		for (const badgeDef of badgeDefs) {
			const concernedReports = userReportsAggregation.filter((report) =>
				badgeDef.list_terms.includes(report.activity_term),
			);

			const count = concernedReports
				.map((report) => report.count)
				.reduce((a, b) => a + b, 0);

			if (count >= badgeDef.count_threshold) {
				this.logger.log(
					`user ${curator_orcid} has earned the badge: ${badgeDef.name}`,
				);
				// badge is earned at this moment
				const badgeObject = badgeDef.toObject();
				delete badgeObject._id;

				const badgeUpdatePromise = this.badgeModel.updateOne(
					{ resource_id, curator_orcid, name: badgeDef.name },
					{
						$set: {
							curator_orcid,
							...badgeObject,
							count,
						},
					},
					{ upsert: true },
				);

				badgeUpdatePromises.push(badgeUpdatePromise);
			}
		}

		// // while iterating each report in order
		// for await (const report of userReportsIterator) {
		// 	// before doing anything, we check if the user earned all the badges
		// 	// threrfore no additional processing is required
		// 	if (resourceBadgeCount === earnedBadges.length) {
		// 		break;
		// 	}

		// 	// we check on our achievedTasks Map if the task has already been added
		// 	if (achievedTasks.has(report.activity_term)) {
		// 		// if the task has been added the value is updated
		// 		let achieved = achievedTasks.get(report.activity_term);
		// 		achieved += 1;
		// 		achievedTasks.set(report.activity_term, achieved);
		// 	} else {
		// 		// otherwise, it is initialized to 1
		// 		achievedTasks.set(report.activity_term, 1);
		// 	}

		// 	// we then query all the non-earned badges
		// 	const badgeDefIterator = this.achievementDefModel
		// 		.find({
		// 			resource_id,
		// 			type: 'badge',
		// 			name: { $nin: earnedBadges },
		// 			// TODO: checkout potential optimization
		// 			// list_terms: report.activity_term,
		// 		})
		// 		.cursor();

		// 	for await (const badgeDef of badgeDefIterator) {
		// 		// check if the badge is concerned by the report
		// 		if (!badgeDef.list_terms.includes(report.activity_term)) {
		// 			continue;
		// 		}
		// 		// check if the badge is earned
		// 		const concernedTasks = [...achievedTasks].filter(([key, value]) =>
		// 			badgeDef.list_terms.includes(key),
		// 		);

		// 		// compute the count of the concerned reports
		// 		const count = concernedTasks
		// 			.map(([term, count]) => count)
		// 			.reduce((a, b) => a + b, 0);

		// 		if (count > badgeDef.count_threshold) {
		// 			this.logger.log(
		// 				`user ${curator_orcid} has earned the badge: ${badgeDef.name}`,
		// 			);
		// 			// badge is earned at this moment
		// 			earnedBadges.push(badgeDef.name);
		// 			const badgeObject = badgeDef.toObject();
		// 			delete badgeObject._id;

		// 			const badgeUpdatePromise = this.badgeModel.updateOne(
		// 				{ resource_id, curator_orcid, name: badgeDef.name },
		// 				{
		// 					$set: {
		// 						curator_orcid,
		// 						...badgeObject,
		// 						earned_at: report.timestamp,
		// 						count,
		// 					},
		// 				},
		// 				{ upsert: true },
		// 			);

		// 			badgeUpdatePromises.push(badgeUpdatePromise);
		// 		}
		// 	}
		// }

		const updatePromises$ = await Promise.all(badgeUpdatePromises);

		// const badgeCount = await this.badgeModel.count({
		// 	curator_orcid,
		// 	resource_id,
		// 	earned: true,
		// });

		// await this.eventEmitter.emitAsync(ON_USER_BADGES_UPDATE, {
		// 	resource_id,
		// 	curator_orcid,
		// });
		return updatePromises$;
	}

	public async incrementalBadgeCompute(report: Report) {
		throw new Error('Not Implemented');
		const { activity_term, curator_orcid, resource_id } = report;

		const reportMeta = report.getMetaFields();

		const concernedBadges = await this.badgeDefModel.find({
			list_terms: activity_term,
			resource_id,
		});

		const existingBadges = await this.badgeModel.find({
			list_terms: activity_term,
			resource_id,
			curator_orcid,
			...reportMeta,
		});

		const badgesEntries = existingBadges.map((badge) => {
			return [badge.name, badge.toObject()];
		});

		const existingBadgesMap = new Map<string, any>(
			badgesEntries.map(([key, value]) => [key.toString(), value]),
		);

		const badgeDocumentsToInsert: BadgeDocument[] = [];
		const badgeDocumentsToUpdate: BadgeDocument[] = [];

		for (const badgeDef of concernedBadges) {
			if (existingBadgesMap.has(badgeDef.name)) {
				const badge = existingBadgesMap.get(badgeDef.name);
				badge.count += 1;
				badge.earned =
					badge.count > badgeDef.count_threshold
						? AchievementState.achieved
						: AchievementState.progress;
				if (badge.earned === AchievementState.achieved) {
					badge.earned_at = report.timestamp;
				}
				badgeDocumentsToUpdate.push(badge);
			} else {
				const badge = new this.badgeModel({
					...badgeDef.toObject(),
					curator_orcid,
					earned:
						1 >= badgeDef.count_threshold
							? AchievementState.achieved
							: AchievementState.progress,
					count: 1,
					earned_at: 1 >= badgeDef.count_threshold ? report.timestamp : null,
					...reportMeta,
				});
				badgeDocumentsToInsert.push(badge);
			}
		}

		await this.badgeModel.insertMany(badgeDocumentsToInsert);

		const updatePromises$ = concernedBadges.map(
			async ({
				name,
				count_threshold,
				resource_id,
				category,
				list_terms,
				resource_uri,
			}: BadgeDefDocument) => {
				return await this.upsertBadge(
					{
						name,
						resource_id,
						curator_orcid,
						...reportMeta,
					},
					{
						$setOnInsert: {
							name,
							count_threshold,
							resource_id,
							curator_orcid,
							category,
							resource_uri,
							list_terms,
						},
						$inc: {
							count: 1,
						},
					},
				);
			},
		);

		await Promise.all(updatePromises$);

		// TODO: Either separate badgeCount between different reports or group them
		const badgeCount = await this.badgeModel.count({
			curator_orcid,
			resource_id,
			earned: true,
		});

		await this.eventEmitter.emitAsync(ON_BADGES_UPDATE, {
			resource_id,
			curator_orcid,
			badgeCount,
		});
	}

	private async upsertBadge(
		filter: FilterQuery<BadgeDocument>,
		update: UpdateQuery<BadgeDocument>,
	) {
		try {
			const updateResponse = await this.badgeModel.updateOne(filter, update, {
				upsert: true,
			});

			return updateResponse;
		} catch (err: any) {
			if (!(err instanceof MongoServerError) || err.code != 11000) {
				this.logger.error(err.message, err.stack, err.name);
				throw new Error(
					`Failed to update badge selected by ${filter} with update ${update}`,
				);
			}

			this.logger.verbose('Error upserting document update, attempt to update');
			const updateResponse = await this.badgeModel.updateOne(filter, update);

			return updateResponse;
		}
	}
}
