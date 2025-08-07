import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Aggregate, FilterQuery, LeanDocument } from 'mongoose';
import { BadgeDefDocument } from 'src/core/schemas/index';
import { PrivacyType } from '../../core/enums';
import {
	Report,
	ReportDocument,
	ReportModel,
} from '../../core/schemas/reports.schema';
import { getMatchingReportFilter } from '../helpers/helpers';

export interface GroupedReportsByUser {
	_id: string;
	count: number;
	resource_id: string;
	activity_terms: string[];
	privacy: PrivacyType;
	league: string;
	curator_orcid: string;
}

export interface BadgeAggregatedReports {
	_id: string;
	count: number;
	resource_id: string;
	activity_terms: string[];
	privacy: PrivacyType;
	league: string;
	curator_orcid: string;
}

@Injectable()
export class GroupReportsByUserAggregator {
	constructor(@InjectModel(Report.name) protected reportModel: ReportModel) {}

	aggregate(
		filter: FilterQuery<ReportDocument>,
	): Aggregate<GroupedReportsByUser[]> {
		const group: Record<keyof GroupedReportsByUser, unknown> = {
			_id: '$curator_orcid',
			count: { $sum: 1 },
			resource_id: { $first: '$resource_id' },
			activity_terms: { $addToSet: '$activity_term' },
			privacy: { $first: '$privacy' },
			league: { $first: '$league' },
			curator_orcid: { $first: '$curator_orcid' },
		};
		const agg = this.reportModel
			.aggregate<GroupedReportsByUser>()
			.match(filter)
			.group(group)
			.sort({
				resource_id: -1,
				league: -1,
				curator_orcid: -1,
			});

		return agg;
	}

	groupReportsByBadgeDef(
		badgeDef: LeanDocument<BadgeDefDocument>,
	): Aggregate<BadgeAggregatedReports[]> {
		return this.reportModel
			.aggregate()
			.match(getMatchingReportFilter(badgeDef))
			.group({
				_id: '$curator_orcid',
				count: { $sum: 1 },
				resource_id: { $first: '$resource_id' },
				activity_terms: { $addToSet: '$activity_term' },
				privacy: { $first: '$privacy' },
				league: { $first: '$league' },
				curator_orcid: { $first: '$curator_orcid' },
			})
			.sort({
				count: -1,
			});
	}
}
