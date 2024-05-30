import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Aggregate, FilterQuery, Model } from 'mongoose';
import { ReportDocument, Report } from '../../core/schemas/reports.schema';
import { PrivacyType } from '../../core/enums';

export interface GroupedReportsByUser {
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
	constructor(
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
	) {}

	aggregate(
		filter: FilterQuery<ReportDocument>,
	): Aggregate<GroupedReportsByUser[]> {
		return this.reportModel
			.aggregate()
			.match(filter)
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
				resource_id: -1,
				league: -1,
				curator_orcid: -1,
			}) as unknown as Aggregate<GroupedReportsByUser[]>;
	}
}
