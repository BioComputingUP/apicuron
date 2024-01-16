import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Cursor } from 'mongoose';
import {
	AchievementDef,
	AchievementDefDocument,
} from '../core/schemas/achievement-def.schema';
import { Badge, BadgeDocument } from '../core/schemas/badges.schema';
import { Medal, MedalDocument } from '../core/schemas/medals.schema';
import { Report, ReportDocument } from '../core/schemas/reports.schema';
import { User, UserDocument } from '../core/schemas/user.schema';
import { PartnerResourcesService } from '../resources/partner-resources/partner-resources.service';
import { ON_TERM_DELETED, ON_TERM_UPDATED } from '../terms/constants';
import {
	ON_BADGE_DEF_DELETE,
	ON_BADGE_DEF_UPDATE,
	ON_COMPUTE_RESOURCE_ACHIEVEMENTS,
	ON_COMPUTE_USER_ACHIEVEMENTS,
	ON_MEDAL_DEF_DELETE,
	ON_MEDAL_DEF_UPDATE,
} from './constants';
import { UpdateTermDto } from '../terms/dto/updateTerm.dto';
import { DeleteTermDto } from '../terms/dto/deleteTerm.dto';
import { ON_REPORTS_INSERT, ON_REPORT_INSERT } from '../reports/constants';
import { ReportDto } from '../reports/dto/report.dto';
import { DeleteBadgeDefDto } from './dto/badge-crud.dto';
import { DeleteMedalDefDto } from './dto/medal-crud.dto';
import _ from 'lodash';

@Injectable()
export class ComputeAchievementsService {
	constructor(
		@InjectModel(Medal.name) protected medalModel: Model<MedalDocument>,
		protected partnerResourceService: PartnerResourcesService,
		@InjectModel(User.name) protected userModel: Model<UserDocument>,
		@InjectModel(Badge.name) protected badgeModel: Model<BadgeDocument>,
		@InjectModel(AchievementDef.name)
		private achievementDefModel: Model<AchievementDefDocument>,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
		protected eventEmitter: EventEmitter2,
	) {}

	logger = new Logger(ComputeAchievementsService.name);

	async computeResourceMedals({ resource_id }: { resource_id: string }) {
		const deletionResponse = await this.medalModel.deleteMany({ resource_id });
		this.logger.log(
			`Deleted ${deletionResponse.deletedCount} medals for resource ${resource_id}`,
		);

		// const { data: medalDefs } = await this.achievementsDefService.get_medals(MedalsFilter.create({ resource_id }))

		const medalDefs = await this.achievementDefModel.find({
			resource_id,
			type: 'medal',
		});

		const medal_saves_promises = [];

		for (let i = 0; i < medalDefs.length; i++) {
			// for each medal definition in the list, we add the medal to the user
			const medalDef = medalDefs[i];

			this.logger.debug(`Working on Medal ${medalDef.name}`);

			const user_reports = this.medalReportsAggregation(medalDef)
				.limit(medalDef.score_relative)
				.cursor();

			// user_reports is sorted based on their scores, we just need to load the 'n' first
			// users where 'n' is the score_relative of the medal
			let score_relative_index = 0;
			for await (const user of user_reports) {
				if (user) {
					const medalObject = medalDef.toObject();
					delete medalObject['_id'];
					this.logger.debug(
						`Checking if user ${user['_id']['curator_orcid']} earned  ${medalDef.name}`,
					);

					const medal = new this.medalModel({
						...medalObject,
						_id: null,
						curator_orcid: user['_id']['curator_orcid'],
						count_total: user['count'],
						score_total: user['score_sum'],
						score_relative_index,
						count_relative_valid: true,
						count_threshold_valid: true,
						score_threshold_valid: true,
					});
					score_relative_index++;
					medal_saves_promises.push(medal.save());
				}
			}
		}

		this.logger.log(
			`${medal_saves_promises.length} curators earned medals for resource ${resource_id}`,
		);
		await Promise.all(medal_saves_promises);
	}

	private medalReportsAggregation(medal: AchievementDef) {
		// first we first filter all the reports by the resource
		// and the terms that are concerned by the medals
		const match_dict = {
			resource_id: medal.resource_id,
			activity_term: {
				$in: medal.list_terms,
			},
		};

		// if the medal has a time constraint we make sure it's added to the filter
		if (medal.first_day) {
			match_dict['timestamp'] = { $gte: medal.first_day };
		}

		if (medal.last_day) {
			// if the timestamp object doesn't exist, it is created otherwise it is updated
			if (!match_dict['timestamp']) {
				match_dict['timestamp'] = { $lte: medal.last_day };
			} else {
				match_dict['timestamp'] = {
					...match_dict['timestamp'],
					$lte: medal.last_day,
				};
			}
		}
		return (
			this.reportModel
				.aggregate()
				.match(match_dict)
				// # here we lookup and unwind from the terms_def collection to get the term score
				.lookup({
					from: 'terms_def',
					localField: 'activity_term',
					foreignField: 'activity_term',
					as: 'result',
				})
				.unwind({ path: '$result' })
				.project({
					curator_orcid: 1,
					activity_term: 1,
					score: '$result.score',
				})
				// # here we group by curator while computing the count and score sum
				.group({
					_id: {
						curator_orcid: '$curator_orcid',
					},
					count: {
						$sum: 1,
					},
					score_sum: {
						$sum: '$score',
					},
				})
				// and we sort the output in decreasing order based on the score_sum
				.sort({
					score_sum: -1,
				})
		);
	}

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

	public async computeUserAchievements({
		user,
		resource,
	}: {
		user: { orcid_id: string };
		resource: { resource_id: string };
	}) {
		const computeResults = await Promise.all([
			this.computeUserBadges({ user, resource }),
			this.computeResourceMedals(resource),
		]);

		await this.eventEmitter.emitAsync(ON_COMPUTE_USER_ACHIEVEMENTS, {
			user,
			resource,
		});

		return computeResults;
	}

	public async computeResourceAchievements(resource: { resource_id: string }) {
		const computeResults = await Promise.all([
			this.computeResourceMedals(resource),
			this.computeResourceBadges(resource),
		]);

		await this.eventEmitter.emitAsync(ON_COMPUTE_RESOURCE_ACHIEVEMENTS, {
			resource,
		});

		return computeResults;
	}

	// event handling

	@OnEvent(ON_TERM_UPDATED, { async: true })
	async on_term_updated(term: UpdateTermDto) {
		const { resource_id } = term;
		return await this.computeResourceAchievements({ resource_id });
	}

	@OnEvent(ON_TERM_DELETED, { async: true })
	async on_term_deleted(termDelete: DeleteTermDto) {
		const { resource_id } = termDelete;
		return await this.computeResourceAchievements({ resource_id });
	}

	@OnEvent(ON_BADGE_DEF_UPDATE, { async: true })
	async on_badge_def_update(badge: Badge) {
		const { resource_id } = badge;
		return await this.computeResourceAchievements({ resource_id });
	}

	@OnEvent(ON_BADGE_DEF_DELETE, { async: true })
	async on_badge_def_delete(deleteBadgeDef: DeleteBadgeDefDto) {
		const { resource_id } = deleteBadgeDef;
		return await this.computeResourceAchievements({ resource_id });
	}

	@OnEvent(ON_MEDAL_DEF_UPDATE, { async: true })
	async on_medal_def_update(medalDef: Medal) {
		const { resource_id } = medalDef;
		return await this.computeResourceAchievements({ resource_id });
	}

	@OnEvent(ON_MEDAL_DEF_DELETE, { async: true })
	async onTermUpdate(deleteMedalDef: DeleteMedalDefDto) {
		const { resource_id } = deleteMedalDef;
		return await this.computeResourceAchievements({ resource_id });
	}

	@OnEvent(ON_REPORT_INSERT, { async: true })
	async onReportInsert(report: ReportDto) {
		const { resource_id, curator_orcid } = report;
		return await this.computeUserAchievements({
			user: { orcid_id: curator_orcid },
			resource: { resource_id },
		});
	}

	@OnEvent(ON_REPORTS_INSERT, { async: true })
	async onReportsInsert(reports: Report[]) {
		const resource_ids = _.uniq(reports.map(({ resource_id }) => resource_id));

		const computeAchievementsPromises$ = resource_ids.map(
			async (resource_id) => {
				return await this.computeResourceAchievements({ resource_id });
			},
		);

		return await Promise.all(computeAchievementsPromises$);
	}
}
