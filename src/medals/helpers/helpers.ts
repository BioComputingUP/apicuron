import { FilterQuery } from 'mongoose';
import {
	LeanReportDocument,
	ReportDocument,
} from '../../core/schemas/reports.schema';
import { MedalDefDocument } from '../../core/schemas/achievements-def/medal-def.schema';
import { MedalDocument } from '../../core/schemas/achievements/medals.schema';
import _ from 'lodash';

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
	medalDef: MedalDefDocument,
): FilterQuery<ReportDocument> {
	let timestampFilter = null;
	if (medalDef.last_day) {
		timestampFilter = { $lte: medalDef.last_day, ...timestampFilter };
	}
	if (medalDef.first_day) {
		timestampFilter = { $gte: medalDef.first_day, ...timestampFilter };
	}
	const filter: FilterQuery<ReportDocument> = {
		resource_id: medalDef.resource_id,
		league: medalDef.league,
		activity_term: { $in: medalDef.list_terms },
	};

	if (!_.isEmpty(timestampFilter)) {
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
