import { FilterQuery, LeanDocument, Model } from 'mongoose';
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
	badgeDef: LeanDocument<BadgeDefDocument> | BadgeDefDocument,
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

export function getRelatedBadges(
	badgeDef: LeanDocument<BadgeDefDocument>,
): FilterQuery<BadgeDocument> {
	return {
		resource_id: badgeDef.resource_id,
		league: badgeDef.league,
		name: badgeDef.name,
	};
}
