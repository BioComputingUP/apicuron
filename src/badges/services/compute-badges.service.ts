import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { FilterQuery, Model } from 'mongoose';
import {
	Badge,
	BadgeDocument,
} from '../../core/schemas/achievements/badges.schema';
import {
	BadgeDef,
	BadgeDefDocument,
} from '../../core/schemas/achievements-def/badge-def.schema';
import { AchievementState } from '../../core/enums';
import { computeAggregatePrivacyField } from '../../util/privacy.helper';
import { EventEmitter2 } from '@nestjs/event-emitter';
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

			const reportAggregationByUser = this.groupReportsByUser
				.aggregate(getMatchingReportFilter(badgeDef))
				.cursor({ batchSize: 50 });

			const badges$ = [];

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
		}

		await Promise.all(userBadgesPromises$);

		this.logger.log(`Computed ${userBadgesPromises$.length} badges`);

		return {
			badgeCount: userBadgesPromises$.length,
			badgeDefsCount: badgeDefCount,
		};
	}

	public async reComputeBadges(
		filter: FilterQuery<BadgeDefDocument>,
	): Promise<{ badgeCount: number; badgeDefsCount: number }> {
		await this.badgeModel.deleteMany(filter);
		return await this.computeBadges(filter);
	}
}
