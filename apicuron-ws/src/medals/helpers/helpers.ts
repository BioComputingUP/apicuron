import { FilterQuery, LeanDocument } from 'mongoose';
import { MedalDefDocument } from '../../core/schemas/achievements-def/medal-def.schema';
import { MedalDocument } from '../../core/schemas/achievements/medals.schema';
import {
	LeanReportDocument,
	ReportDocument,
} from '../../core/schemas/reports.schema';

export function GetRelatedMedalDefFilter(
	report: ReportDocument | LeanReportDocument,
): FilterQuery<MedalDefDocument> {
	return {
		$and: [
			{
				resource_id: report.resource_id,
				league: report.league,
				list_terms: report.activity_term,
			},
			{
				$or: [
					{ last_day: { $exists: false } },
					{
						last_day: {
							$exists: true,
							$gte: report.timestamp,
						},
					},
				],
			},
			{
				$or: [
					{ first_day: { $exists: false } },
					{
						first_day: {
							$exists: true,
							$lte: report.timestamp,
						},
					},
				],
			},
		],
	};
}

export function GetrelatedReportFilter(
	medalDef: MedalDefDocument | LeanDocument<MedalDefDocument>,
): FilterQuery<ReportDocument> {
	const timestampFilter: { $lte?: Date; $gte?: Date } = {};
	if (medalDef.last_day) {
		timestampFilter.$lte = medalDef.last_day;
	}
	if (medalDef.first_day) {
		timestampFilter.$gte = medalDef.first_day;
	}

	const filter: FilterQuery<ReportDocument> = {
		resource_id: medalDef.resource_id,
		league: medalDef.league,
		activity_term: { $in: medalDef.list_terms },
	};

	if (Object.keys(timestampFilter).length > 0) {
		filter.timestamp = timestampFilter;
	}

	return filter;
}

export function GetRelatedMedalFilter(
	report: ReportDocument | LeanReportDocument,
): FilterQuery<MedalDocument> {
	return {
		$and: [
			{
				curator_orcid: report.curator_orcid,
				resource_id: report.resource_id,
				league: report.league,
				list_terms: report.activity_term,
			},
			{
				$or: [
					{ last_day: { $exists: false } },
					{
						last_day: {
							$exists: true,
							$gte: report.timestamp,
						},
					},
				],
			},
			{
				$or: [
					{ first_day: { $exists: false } },
					{
						first_day: {
							$exists: true,
							$lte: report.timestamp,
						},
					},
				],
			},
		],
	};
}
