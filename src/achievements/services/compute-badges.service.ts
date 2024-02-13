import { Injectable, Logger } from '@nestjs/common';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { Cursor, FilterQuery, Model, UpdateQuery } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../core/schemas/user.schema';
import {
	Badge,
	BadgeDocument,
} from '../../core/schemas/achievements/badges.schema';
import { PartnerResourcesService } from '../../resources/partner-resources/partner-resources.service';
import { MongoServerError } from 'mongodb';
import {
	BadgeDef,
	BadgeDefDocument,
} from '../../core/schemas/achievements-def/badge-def.schema';
import {
	AchievementDef,
	AchievementDefDocument,
} from '../../core/schemas/achievements-def/achievement-def.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ON_BADGES_UPDATE } from '../constants';
import { AchievementState } from '../../core/enums';
import { privateDecrypt } from 'crypto';
import {
	assignPrivacyField,
	computePrivacyField,
} from '../../util/privacy.helper';

@Injectable()
export class ComputeBadgesService {
	constructor(
		protected partnerResourceService: PartnerResourcesService,
		@InjectModel(User.name) protected userModel: Model<UserDocument>,
		@InjectModel(Badge.name) protected badgeModel: Model<BadgeDocument>,
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

		const userReportsAggregation = await this.reportModel
			.aggregate()
			.match({
				resource_id,
				curator_orcid,
			})
			.group({
				_id: {
					activity_term: '$activity_term',
					league: '$league',
				},
				curator_orcid: { $first: '$curator_orcid' },
				resource_id: { $first: '$resource_id' },
				activity_term: { $first: '$activity_term' },
				league: { $first: '$league' },
				count: {
					$count: {},
				},
			});

		const badgeDefs = await this.badgeDefModel.find(
			{ resource_id },
			{ batchSize: 50 },
		);

		const badgeUpdatePromises = [];

		for (const badgeDef of badgeDefs) {
			const concernedReports = userReportsAggregation.filter(
				(report) =>
					report.league === badgeDef.league &&
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

	public async incrementalBadgeCompute(report: ReportDocument) {
		const { activity_term, resource_id, league } = report;

		const concernedBadges = await this.badgeDefModel.find({
			list_terms: activity_term,
			resource_id,
			league,
		});

		const badges$ = concernedBadges.map(async (badgeDef) => {
			return await this.upsertBadge(badgeDef, report);
		});

		await Promise.all(badges$);
	}

	private async upsertBadge(
		badgeDef: BadgeDefDocument,
		report: ReportDocument,
	) {
		// this.logger.debug(`Upserting badge ${badgeDef.name}`);
		delete badgeDef._id;
		try {
			const updateResponse = await this.badgeModel.updateOne(
				{
					resource_id: report.resource_id,
					curator_orcid: report.curator_orcid,
					name: badgeDef.name,
					league: badgeDef.league,
				},
				[
					{
						$set: {
							...badgeDef.toObject(),
							curator_orcid: report.curator_orcid,
							count: {
								$cond: [
									{
										$eq: ['$count', null],
									},
									1,
									{
										$add: ['$count', 1],
									},
								],
							},
							state: {
								$cond: {
									if: {
										$gte: [{ $add: ['$count', 1] }, badgeDef.count_threshold],
									},
									then: AchievementState.achieved,
									else: AchievementState.progress,
								},
							},
						},
					},
				],
				{
					upsert: true,
				},
			);

			// this.logger.log(
			// 	`Ran upsert on Badge ${badgeDef.name} for user ${report.curator_orcid}, updated: ${updateResponse.modifiedCount}, upserted: ${updateResponse.upsertedCount}`,
			// );

			return updateResponse;
		} catch (err: any) {
			if (!(err instanceof MongoServerError) || err.code != 11000) {
				this.logger.error(err.message, err.stack, err.name);
				throw new Error(
					`Failed to update badge selected by for badgeDef: ${badgeDef.name}`,
				);
			}

			this.logger.verbose('Error upserting document update, attempt to update');
			const updateResponse = await this.badgeModel.updateOne(
				{
					resource_id: report.resource_id,
					curator_orcid: report.curator_orcid,
					name: badgeDef.name,
					league: badgeDef.league,
				},
				[
					{
						$set: {
							...badgeDef.toObject(),
							count: {
								$add: ['$count', 1],
							},
							state: {
								$cond: {
									if: {
										$gte: [{ $add: ['$count', 1] }, badgeDef.count_threshold],
									},
									then: AchievementState.achieved,
									else: AchievementState.progress,
								},
							},
						},
					},
				],
			);

			this.logger.debug(
				`Badge updated, modified Count: ${updateResponse.modifiedCount}, Matched Count: ${updateResponse.matchedCount}`,
			);

			return updateResponse;
		}
	}

	public async computeAllBadges(
		badgeDefFilter: FilterQuery<BadgeDefDocument> = {},
	) {
		await this.badgeModel.deleteMany({});
		const badgeDefs = this.badgeDefModel
			.find(
				badgeDefFilter,
				{},
				{
					batchSize: 50,
					sort: { resource_id: -1, league: -1, curator_orcid: -1 },
				},
			)
			.cursor();

		const resources = await this.partnerResourceService.get_resources({});

		const resourceMap = new Map(resources.map((r) => [r.resource_id, r]));

		const badgeSaves = [];

		for await (const badgeDef of badgeDefs) {
			delete badgeDef._id;
			const aggregation = await this.reportModel
				.aggregate()
				.match({
					activity_term: { $in: badgeDef.list_terms },
					league: badgeDef.league,
					resource_id: badgeDef.resource_id,
				})
				.group({
					_id: '$curator_orcid',
					count: { $count: {} },
					resource_id: { $first: '$resource_id' },
					league: { $first: '$league' },
					curator_orcid: { $first: '$curator_orcid' },
				});

			const badges$ = aggregation.map(async (report) => {
				const user = await this.userModel.findOne({
					orcid_id: report.curator_orcid,
				});
				const badge = new this.badgeModel({
					...badgeDef.toObject(),
					_id: undefined,
					curator_orcid: report.curator_orcid,
					count: report.count,
					state:
						report.count >= badgeDef.count_threshold
							? AchievementState.achieved
							: AchievementState.progress,
				});
				computePrivacyField(resourceMap.get(report.resource_id), user, badge);

				return badge.save();
			});

			badgeSaves.push(Promise.all(badges$));
		}

		await Promise.all(badgeSaves);
	}

	public async incrementalBadgesCompute() {
		const reports = this.reportModel
			.find({}, {}, { batchSize: 300 })
			.sort({ resource_id: -1, curator_orcid: -1 });
		let i = 0;
		let currentResId = null;
		let badges = [];

		const badgeComputePromises$ = [];
		for await (const report of reports) {
			const { activity_term, resource_id, league } = report;

			if (currentResId !== resource_id) {
				currentResId = resource_id;
				badges = await this.badgeDefModel.find({
					resource_id,
				});
			}

			const concernedBadges = badges.filter(
				(badgeDef) =>
					badgeDef.list_terms.includes(activity_term) &&
					badgeDef.league === league,
			);

			const badges$ = concernedBadges.map(async (badgeDef) => {
				return await this.upsertBadge(badgeDef, report);
			});

			//await Promise.all(badges$); const badgeCompute = this.incrementalBadgeCompute(report);

			const badgeCompute = Promise.all(badges$);

			badgeComputePromises$.push(badgeCompute);
			if (i % 500 === 0) {
				this.logger.debug('Processed 500 reports');
			}
			i++;
		}
		try {
			await Promise.all(badgeComputePromises$);
		} catch (err: any) {
			if (err instanceof Error) {
				this.logger.error(err.message, err.stack, err.name);
				throw new Error('An error occured while computing badges for reports');
			}
		}
	}
}
