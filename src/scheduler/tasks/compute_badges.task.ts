import { Injectable, Logger } from '@nestjs/common';
import { PartnerResourcesService } from '../../resources/partner-resources/partner-resources.service';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../core/schemas/resource.schema';
import { Badge, BadgeDocument } from '../../core/schemas/badges.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Cursor, Model } from 'mongoose';
import { TaskArgument } from '../../scheduler-client/types/baseTask';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import {
	AchievementDef,
	AchievementDefDocument,
} from '../../core/schemas/achievement-def.schema';
import { User, UserDocument } from '../../core/schemas/user.schema';
import { OnEvent } from '@nestjs/event-emitter';
import {
	COMPUTE_RESOURCE_BADGES_TASK,
	COMPUTE_USER_BADGES_TASK,
} from '../contants';

@Injectable()
export class ComputeBadgesTask {
	constructor(
		protected partnerResourceService: PartnerResourcesService,
		@InjectModel(User.name) protected userModel: Model<UserDocument>,
		@InjectModel(Badge.name) protected badgeModel: Model<BadgeDocument>,
		@InjectModel(AchievementDef.name)
		private achievementDefModel: Model<AchievementDefDocument>,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
	) {}

	logger = new Logger(ComputeBadgesTask.name);

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
			this.logger.log(
				`Computing Badges for user ${orcid_id} for resource ${resource_id}`,
			);

			const user = await this.userModel.findOne({ orcid_id });
			if (user) {
				await this.computeUserBadges({ resource, user: { orcid_id } });
			} else {
				this.logger.error(`User ${orcid_id} Not found !!`);
			}
		} else {
			this.logger.log(`Computing Badges for resource ${resource_id}`);

			await this.computeResourceBadges(resource);
		}
	}

	@OnEvent(COMPUTE_RESOURCE_BADGES_TASK, { async: true })
	public async computeResourceBadges(resource: PartnerResourceDocument) {
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

	@OnEvent(COMPUTE_USER_BADGES_TASK, { async: true })
	public async computeUserBadges(payload: {
		resource: PartnerResourceDocument;
		user: { orcid_id: string };
	}) {
		const {
			resource: { resource_id },
			user: { orcid_id: curator_orcid },
		} = payload;
		// Iterate Over reports from the oldest to newest
		const userReportsIterator = this.reportModel
			.find({ resource_id, curator_orcid }, {}, { $sort: { timestamp: 1 } })
			.cursor();

		const resourceBadgeCount = await this.achievementDefModel.count({
			resource_id,
			type: 'badge',
		});

		// create a map to store Achieved Tasks of the curator
		const achievedTasks = new Map<string, number>();

		// create an array to store earned badges and when they were earned
		const earnedBadges: string[] = [];

		const badgeUpdatePromises = [];

		// while iterating each report in order
		for await (const report of userReportsIterator) {
			// before doing anything, we check if the user earned all the badges
			// threrfore no additional processing is required
			if (resourceBadgeCount === earnedBadges.length) {
				break;
			}

			// we check on our achievedTasks Map if the task has already been added
			if (achievedTasks.has(report.activity_term)) {
				// if the task has been added the value is updated
				let achieved = achievedTasks.get(report.activity_term);
				achieved += 1;
				achievedTasks.set(report.activity_term, achieved);
			} else {
				// otherwise, it is initialized to 1
				achievedTasks.set(report.activity_term, 1);
			}

			// we then query all the non-earned badges
			const badgeDefIterator = this.achievementDefModel
				.find({ resource_id, type: 'badge', name: { $nin: earnedBadges } })
				.cursor();

			for await (const badge of badgeDefIterator) {
				if (badge.list_terms.includes(report.activity_term)) {
					// check if the badge is earned
					const concernedTasks = [...achievedTasks].filter(([key, value]) =>
						badge.list_terms.includes(key),
					);

					const count = concernedTasks
						.map(([term, count]) => count)
						.reduce((a, b) => a + b, 0);

					if (count > badge.count_threshold) {
						this.logger.log(
							`user ${curator_orcid} has earned the badge: ${badge.name}`,
						);
						// badge is earned at this moment
						earnedBadges.push(badge.name);
						const badgeObject = badge.toObject();
						delete badgeObject._id;

						const badgeUpdatePromise = this.badgeModel.updateOne(
							{ resource_id, curator_orcid, name: badge.name },
							{
								$set: {
									curator_orcid,
									...badgeObject,
									earned_at: report.timestamp,
									count,
								},
							},
							{ upsert: true },
						);

						badgeUpdatePromises.push(badgeUpdatePromise);
					}
				}
			}
		}

		return await Promise.all(badgeUpdatePromises);
	}
}
