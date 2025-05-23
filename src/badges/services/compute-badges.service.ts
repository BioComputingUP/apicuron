import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import * as _ from 'lodash';
import { FilterQuery, Model } from 'mongoose';
import { AchievementState } from '../../core/enums';
import {
	BadgeDef,
	BadgeDefDocument,
} from '../../core/schemas/achievements-def/badge-def.schema';
import {
	Badge,
	BadgeDocument,
} from '../../core/schemas/achievements/badges.schema';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { computeAggregatePrivacyField } from '../../util/privacy.helper';
import {
	GroupedReportsByUser,
	GroupReportsByUserAggregator,
} from '../aggregation/group-reports-by-user.service';
import { getMatchingReportFilter } from '../helpers/helpers';
@Injectable()
export class ComputeBadgesService {
	constructor(
		protected groupReportsByUser: GroupReportsByUserAggregator,
		protected eventEmitter: EventEmitter2,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
		@InjectModel(Badge.name) protected badgeModel: Model<BadgeDocument>,
		@InjectModel(BadgeDef.name)
		protected badgeDefModel: Model<BadgeDefDocument>,
	) {}

	logger = new Logger(ComputeBadgesService.name);

	private async buildBadgeFromAggregatedReports(
		badgeDef: BadgeDefDocument,
		reportAgg: GroupedReportsByUser,
	): Promise<BadgeDocument> {
		const state =
			reportAgg.count >= badgeDef.count_threshold
				? AchievementState.achieved
				: AchievementState.progress;
		let achieved_at;
		if (state == AchievementState.achieved) {
			const relevantReportsFilter: FilterQuery<ReportDocument> = {
				...getMatchingReportFilter(badgeDef),
				curator_orcid: reportAgg.curator_orcid,
			};
			const earningReport = await this.reportModel.findOne(
				relevantReportsFilter,
				null,
				{
					sort: { timestamp: 1 },
					skip: badgeDef.count_threshold - 1,
				},
			);
			achieved_at = earningReport.timestamp;
		}
		const badge = new this.badgeModel({
			name: badgeDef.name,
			displayedName: badgeDef.displayedName,
			resource_uri: badgeDef.resource_uri,
			resource_id: badgeDef.resource_id,
			league: badgeDef.league,
			color_code: badgeDef.color_code,
			count_threshold: badgeDef.count_threshold,
			list_terms: badgeDef.list_terms,
			startDate: badgeDef.startDate,
			endDate: badgeDef.endDate,
			curator_orcid: reportAgg.curator_orcid,
			count: reportAgg.count,
			progress_rate: reportAgg.count / badgeDef.count_threshold,
			state,
			achieved_at,
			privacy: computeAggregatePrivacyField(badgeDef, reportAgg),
		});
		return badge;
	}

	public async computeBadges(
		badgeDefFilter: FilterQuery<BadgeDefDocument> = {},
	): Promise<{ badgeCount: number; badgeDefsCount: number }> {
		let badgeDefCount = 0;
		let assignedBadgesCount = 0;

		const badgeDefs = this.badgeDefModel
			.find(
				badgeDefFilter,
				{},
				{
					sort: { resource_id: -1, league: -1 },
				},
			)
			.cursor({ batchSize: 100 });

		const userBadgesPromises$ = [];

		for await (const badgeDef of badgeDefs) {
			badgeDefCount++;
			if (!badgeDef.assignable) {
				const badges$ = [];
				const reportAggregationByUser = this.groupReportsByUser
					.aggregate(getMatchingReportFilter(badgeDef))
					.cursor({ batchSize: 50 });

				for await (const report of reportAggregationByUser) {
					const computeBadge$ = this.buildBadgeFromAggregatedReports(
						badgeDef,
						report,
					).then((badge) => badge.save());

					badges$.push(computeBadge$);
				}
				userBadgesPromises$.push(Promise.all(badges$));
				this.logger.log(
					`Badge ${badgeDef.name} computed for ${badges$.length} users`,
				);
			} else {
				const user_orcids = badgeDef.assigned_to;
				assignedBadgesCount = await this.createAssignedBadges(
					badgeDef,
					user_orcids,
				);
			}
		}

		await Promise.all(userBadgesPromises$);

		this.logger.log(`Computed ${userBadgesPromises$.length} badges`);

		return {
			badgeCount: userBadgesPromises$.length + assignedBadgesCount,
			badgeDefsCount: badgeDefCount,
		};
	}

	public async reComputeBadges(
		filter: FilterQuery<BadgeDefDocument>,
	): Promise<{ badgeCount: number; badgeDefsCount: number }> {
		await this.badgeModel.deleteMany(filter);
		return await this.computeBadges(filter);
	}

	/// create missing assigned badges for a badgeDef
	private async createAssignedBadges(
		badgeDef: BadgeDef,
		user_orcids: string[],
	) {
		// get user orcids that already have the badge
		const existingBadgeDefs = await this.badgeModel.find(
			{
				name: badgeDef.name,
				resource_id: badgeDef.resource_id,
				curator_orcid: { $in: user_orcids },
			},
			{
				curator_orcid: 1,
			},
		);
		const filtered_orcids = _.difference(
			user_orcids,
			existingBadgeDefs.map((b) => b.curator_orcid),
		);
		// TODO: maybe check if the user exists
		const createBadgePromises$ = filtered_orcids.map((user_orcid) => {
			const badge = new this.badgeModel({
				curator_orcid: user_orcid,
				name: badgeDef.name,
				displayedName: badgeDef.displayedName,
				resource_id: badgeDef.resource_id,
				resource_uri: badgeDef.resource_uri,
				league: badgeDef.league ?? 'default',
				color_code: badgeDef.color_code,
				state: AchievementState.achieved,
				achieved_at: new Date(),
				privacy: badgeDef.privacy,
				assignable: true,
			});
			return badge.save();
		});
		await Promise.all(createBadgePromises$);
		this.logger.log(
			`Created ${createBadgePromises$.length} assigned badges for ${badgeDef.name}`,
		);
		return createBadgePromises$.length;
	}
}
