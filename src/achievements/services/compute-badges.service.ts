import { Injectable, Logger } from '@nestjs/common';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { Cursor, FilterQuery, Model } from 'mongoose';
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
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AchievementState } from '../../core/enums';
import { computePrivacyField } from '../../util/privacy.helper';
import { PartnerResourceDocument } from '../../core/schemas/resource/partner-resource.schema';
import { AggregatedReportsByActivities } from '../types/aggregated-reports';
import {
	IBadgeCountChangeEventPayload,
	onBadgesCompute,
} from '../events/events';

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

		await this.computeAllBadges({
			resource_id,
		});
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

		await this.computeAllBadges(
			{
				resource_id,
			},
			{
				curator_orcid,
			},
		);
	}

	/**
	 * Computes incremental badges based on the provided report.
	 * @param report - The report document containing information for badge computation.
	 */
	public async incrementalBadgeCompute(report: ReportDocument) {
		const { activity_term, resource_id, league } = report;

		const bageDefFilter: FilterQuery<BadgeDefDocument> = {
			list_terms: activity_term,
			resource_id,
			league,
		};

		const concernedBadges = await this.badgeDefModel.find(bageDefFilter);

		const badges$ = concernedBadges.map(async (badgeDef) => {
			return await this.upsertBadge(badgeDef, report);
		});

		await Promise.all(badges$);

		await this.eventEmitter.emitAsync(
			onBadgesCompute,
			bageDefFilter as IBadgeCountChangeEventPayload,
		);
	}

	/**
	 * Upserts a badge into the database using the report as an increment
	 *
	 * @param badgeDef - The badge definition document.
	 * @param report - The report document.
	 * @returns The update response from the database.
	 * @throws Error if the update fails.
	 */
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
		reportFilter: FilterQuery<ReportDocument> = {},
	) {
		await this.badgeModel.deleteMany(badgeDefFilter);
		const badgeDefs = this.badgeDefModel
			.find(
				badgeDefFilter,
				{},
				{
					sort: { resource_id: -1, league: -1 },
				},
			)
			.cursor({ batchSize: 50 });

		let currentResource: PartnerResourceDocument | null = null;

		const badgeSaves = [];

		for await (const badgeDef of badgeDefs) {
			delete badgeDef._id;

			// load related resource if necessary
			if (currentResource?.resource_id !== badgeDef.resource_id) {
				currentResource = await this.partnerResourceService.get_resource(
					badgeDef.resource_id,
				);
			}
			const reportAggregationByUser = this.aggregateBadgeReportsByUser(
				badgeDef,
				reportFilter,
			);

			const badges$ = [];

			for await (const report of reportAggregationByUser) {
				const user = await this.userModel.findOne({
					orcid_id: report.curator_orcid,
				});

				const badge = this.buildBadgeFromAggregatedReports(
					badgeDef,
					report,
					currentResource,
					user,
				);

				badges$.push(badge.save());
			}

			badgeSaves.push(Promise.all(badges$));
		}

		await Promise.all(badgeSaves);

		await this.eventEmitter.emitAsync(onBadgesCompute, badgeDefFilter);
	}

	/**
	 * Builds a BadgeDocument object based on the provided parameters.
	 * @param badgeDef - The BadgeDefDocument object defining the badge.
	 * @param reportAgg - The AggregatedReportsByActivities object containing aggregated reports.
	 * @param resource - The PartnerResourceDocument object representing the resource.
	 * @param user - The UserDocument object representing the user.
	 * @returns The built BadgeDocument object.
	 */
	private buildBadgeFromAggregatedReports(
		badgeDef: BadgeDefDocument,
		reportAgg: AggregatedReportsByActivities,
		resource: PartnerResourceDocument,
		user: UserDocument,
	): BadgeDocument {
		const badge = new this.badgeModel({
			...badgeDef.toObject(),
			_id: undefined,
			curator_orcid: reportAgg.curator_orcid,
			count: reportAgg.count,
			state:
				reportAgg.count >= badgeDef.count_threshold
					? AchievementState.achieved
					: AchievementState.progress,
		});
		computePrivacyField(resource, user, badge);
		return badge;
	}

	/**
	 * Loads badge reports by user based on the given badge definition.
	 * @param badgeDef - The badge definition.
	 * @returns A promise that resolves to the aggregated badge reports.
	 */
	private aggregateBadgeReportsByUser(
		badgeDef: BadgeDefDocument,
		reportFilter: FilterQuery<ReportDocument> = {},
		cursorOptions: { batchSize: number } = { batchSize: 50 },
	) {
		const aggregation = this.reportModel
			.aggregate()
			.match({
				...reportFilter,
				activity_term: { $in: badgeDef.list_terms },
				league: badgeDef.league,
				resource_id: badgeDef.resource_id,
			})
			.group({
				_id: '$curator_orcid',
				count: { $sum: 1 },
				resource_id: { $first: '$resource_id' },
				activity_terms: { $addToSet: '$activity_term' },
				league: { $first: '$league' },
				curator_orcid: { $first: '$curator_orcid' },
			})
			.sort({
				resource_id: -1,
				league: -1,
				curator_orcid: -1,
			})
			.cursor(cursorOptions);
		return aggregation as Cursor<
			AggregatedReportsByActivities,
			typeof cursorOptions
		>;
	}

	private async incrementalBadgesCompute() {
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
