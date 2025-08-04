import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import * as _ from 'lodash';
import { LeanDocument } from 'mongoose';
import { AchievementState } from '../../core/enums';
import {
	Badge,
	BadgeDef,
	BadgeDefDocument,
	BadgeDefModel,
	BadgeDocument,
	BadgeModel,
	LeanBadgeDocument,
	LeanReportDocument,
	Report,
	ReportDocument,
	ReportModel,
} from '../../core/schemas';
import { computeAggregatePrivacyField } from '../../util/privacy.helper';
import {
	BadgeAggregatedReports,
	GroupReportsByUserAggregator,
} from '../aggregation/group-reports-by-user.service';
import { getMatchingReportFilter } from '../helpers/helpers';
@Injectable()
export class ComputeBadgesService {
	constructor(
		protected groupReportsByUser: GroupReportsByUserAggregator,
		protected eventEmitter: EventEmitter2,
		@InjectModel(Report.name) protected reportModel: ReportModel,
		@InjectModel(BadgeDef.name)
		protected badgeDefModel: BadgeDefModel,
		@InjectModel(Badge.name) protected badgeModel: BadgeModel,
	) {}

	logger = new Logger(ComputeBadgesService.name);

	async getBadgeEarnedReport(
		badgeDef: LeanDocument<BadgeDefDocument>,
		curator_orcid: string,
	) {
		const reports = await this.reportModel.find(
			{
				$and: [getMatchingReportFilter(badgeDef), { curator_orcid }],
			},
			null,
			{
				sort: { timestamp: 1 },
				skip: badgeDef.count_threshold - 1,
				limit: 1,
			},
		);

		if (reports[0]) {
			return reports[0];
		}
		return null;
	}

	public async buildBadgeFromAggregatedReports(
		badgeDef: BadgeDefDocument | LeanDocument<BadgeDefDocument>,
		reportAgg: BadgeAggregatedReports,
	): Promise<LeanBadgeDocument> {
		const state =
			reportAgg.count >= badgeDef.count_threshold
				? AchievementState.achieved
				: AchievementState.progress;
		let achieved_at: Date | undefined;
		if (state == AchievementState.achieved) {
			achieved_at = reportAgg.earningReport.timestamp;
		}
		const badgeDoc: LeanBadgeDocument = {
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
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		return badgeDoc;
	}

	public async *produceBadgesFromDef(badgeDef: LeanDocument<BadgeDefDocument>) {
		const reportAggregationByUser = this.groupReportsByUser
			.groupReportsByBadgeDef(badgeDef)
			.cursor({ batchSize: 50 });
		for await (const aggregatedReports of reportAggregationByUser) {
			const badge = this.buildBadgeFromAggregatedReports(
				badgeDef,
				aggregatedReports,
			);
			yield badge;
		}
	}

	public initBadgeFromReport(
		badgeDef: LeanDocument<BadgeDefDocument>,
		report: ReportDocument | LeanReportDocument,
	): LeanDocument<BadgeDocument> {
		const privacy = computeAggregatePrivacyField(badgeDef, report);
		const state =
			1 >= badgeDef.count_threshold
				? AchievementState.achieved
				: AchievementState.progress;
		const achieved_at =
			state === AchievementState.achieved ? report.timestamp : undefined;
		return {
			_id: undefined,
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
			curator_orcid: report.curator_orcid, // to be set later
			count: 1,
			progress_rate: 1 / badgeDef.count_threshold,
			state:
				1 >= badgeDef.count_threshold
					? AchievementState.achieved
					: AchievementState.progress,
			privacy,
			createdAt: new Date(),
			updatedAt: new Date(),
			achieved_at,
		};
	}

	/**
	 * Applies a report to a badge, updating its count, progress rate, and achievement state.
	 *
	 * This function increments the badge's count if the report's activity term is included in the badge's list of terms.
	 * It updates the badge's progress rate and, if the count threshold is reached, marks the badge as achieved and sets the achievement timestamp.
	 *
	 * @param badge - The badge document to update.
	 * @param report - The report document containing the activity term and timestamp.
	 * @throws {Error} If the report's activity term is not included in the badge's list of terms.
	 */
	public applyReportOnBadge(
		badge: LeanDocument<BadgeDocument>,
		report: LeanReportDocument,
	): LeanDocument<BadgeDocument> {
		if (!badge.list_terms.includes(report.activity_term)) {
			throw new Error(
				`Report activity term ${report.activity_term} not in badge list terms ${badge.list_terms}, this function should not have been called`,
			);
		}
		const newBadge: LeanDocument<BadgeDocument> = {
			_id: undefined,
			name: badge.name,
			displayedName: badge.displayedName,
			resource_uri: badge.resource_uri,
			resource_id: badge.resource_id,
			league: badge.league,
			color_code: badge.color_code,
			count_threshold: badge.count_threshold,
			list_terms: badge.list_terms,
			startDate: badge.startDate,
			endDate: badge.endDate,
			curator_orcid: badge.curator_orcid,
			privacy: badge.privacy,
			achieved_at: badge.achieved_at,
			createdAt: badge.createdAt,
			updatedAt: badge.updatedAt,
			state: badge.state,
			count: badge.count + 1,
			progress_rate: badge.count / badge.count_threshold,
		};
		if (
			badge.state != AchievementState.achieved &&
			newBadge.count >= newBadge.count_threshold
		) {
			newBadge.state = AchievementState.achieved;
			newBadge.achieved_at = report.timestamp;
		}
		return newBadge;
	}
	async createAssignedBadges(
		badgeDef: BadgeDef,
		user_orcids: string[],
	): Promise<number> {
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
