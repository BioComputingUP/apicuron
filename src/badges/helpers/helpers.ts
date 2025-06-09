import { FilterQuery, Model } from 'mongoose';
import { AchievementState, PrivacyType } from '../../core/enums';
import { BadgeDefDocument } from '../../core/schemas/achievements-def/badge-def.schema';
import { BadgeDocument } from '../../core/schemas/achievements/badges.schema';
import {
	LeanReportDocument,
	ReportDocument,
} from '../../core/schemas/reports.schema';

export function getReportRelatedBadgeDefFilter(
	report: ReportDocument | LeanReportDocument,
): FilterQuery<BadgeDefDocument> {
	return {
		resource_id: report.resource_id,
		league: report.league,
		list_terms: report.activity_term,
	};
}

export function getMatchingReportFilter(
	badgeDef: BadgeDefDocument,
): FilterQuery<ReportDocument> {
	const filter: FilterQuery<ReportDocument> = {
		resource_id: badgeDef.resource_id,
		league: badgeDef.league,
		activity_term: { $in: badgeDef.list_terms },
	};

	if (!!badgeDef.startDate) {
		filter.timestamp = { $gte: badgeDef.startDate, ...filter.timestamp };
	}
	if (!!badgeDef.endDate) {
		filter.timestamp = { $lte: badgeDef.endDate, ...filter.timestamp };
	}
	return filter;
}

export function getReportRelatedBadgeFilter(
	report: ReportDocument | LeanReportDocument,
): FilterQuery<BadgeDocument> {
	return {
		list_terms: report.activity_term,
		resource_id: report.resource_id,
		league: report.league,
		curator_orcid: report.curator_orcid,
	};
}

export function createBadgeFromBadgeDefAndReport(
	badgeModel: Model<BadgeDocument>,
	badgeDef: BadgeDefDocument,
	report: ReportDocument | LeanReportDocument,
): BadgeDocument {
	const privacy = [badgeDef.privacy, report.privacy].includes(
		PrivacyType.private,
	)
		? PrivacyType.private
		: PrivacyType.public;

	return new badgeModel({
		name: badgeDef.name,
		resource_uri: badgeDef.resource_uri,
		resource_id: badgeDef.resource_id,
		league: badgeDef.league,
		curator_orcid: report.curator_orcid,
		count: 1,
		color_code: badgeDef.color_code,
		count_threshold: badgeDef.count_threshold,
		list_terms: badgeDef.list_terms,
		state:
			1 >= badgeDef.count_threshold
				? AchievementState.achieved
				: AchievementState.progress,
		createdAt: new Date(),
		updatedAt: new Date(),
		privacy,
	});
}
