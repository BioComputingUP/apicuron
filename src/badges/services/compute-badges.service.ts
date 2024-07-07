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
			const earningReport = await this.reportModel.findOne(
				{
					curator_orcid: reportAgg.curator_orcid,
					league: badgeDef.league,
					resource_id: badgeDef.resource_id,
					activity_term: { $in: badgeDef.list_terms },
				},
				null,
				{
					sort: { timestamp: 1 },
					limit: badgeDef.count_threshold,
					skip: badgeDef.count_threshold - 1,
				},
			);
			achieved_at = earningReport.timestamp;
		}
		const badge = new this.badgeModel({
			name: badgeDef.name,
			resource_uri: badgeDef.resource_uri,
			resource_id: badgeDef.resource_id,
			league: badgeDef.league,
			color_code: badgeDef.color_code,
			count_threshold: badgeDef.count_threshold,
			list_terms: badgeDef.list_terms,
			curator_orcid: reportAgg.curator_orcid,
			count: reportAgg.count,
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
			.cursor({ batchSize: 50 });

		const badgeSaves = [];

		for await (const badgeDef of badgeDefs) {
			badgeDefCount++;

			const reportAggregationByUser = this.groupReportsByUser
				.aggregate({
					resource_id: badgeDef.resource_id,
					league: badgeDef.league,
					activity_term: { $in: badgeDef.list_terms },
				})
				.cursor({ batchSize: 50 });

			const badges$ = [];

			for await (const report of reportAggregationByUser) {
				const badge = await this.buildBadgeFromAggregatedReports(
					badgeDef,
					report,
				);

				badges$.push(badge.save());
			}

			badgeSaves.push(Promise.all(badges$));

			this.logger.log(
				`Badge ${badgeDef.name} computed for ${badgeSaves.length} users`,
			);
		}

		await Promise.all(badgeSaves);

		this.logger.log(`Computed ${badgeSaves.length} badges`);

		return {
			badgeCount: badgeSaves.length,
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
