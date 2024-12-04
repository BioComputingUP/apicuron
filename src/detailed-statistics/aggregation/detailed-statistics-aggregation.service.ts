import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { Aggregate, FilterQuery, Model } from 'mongoose';
import { PrivacyType } from '../../core/enums';
import {
	getMonthStart,
	getQuarterStart,
	getWeekStart,
} from '../../util/date.helper';
import { PartnerResourceDocument, TermDocument } from '../../core/schemas';
import { UserDocument } from '../../core/schemas/user.schema';
import { LeagueDocument } from '../../core/schemas/league/league.schema';

export interface DetailedStatAggregationResult {
	_id: {
		resource_id: string;
		curator_orcid: string;
		league: string;
		activity_term: string;
	};
	resource_id: string;
	curator_orcid: string;
	league: string;
	activity_term: string;
	privacy: PrivacyType;
	count: number;
	last_contribution: Date;
	first_contribution: Date;
	last_week_count: number;
	last_month_count: number;
	last_quarter_count: number;
	resource: PartnerResourceDocument;
	user: UserDocument;
	league_data: LeagueDocument;
	term: TermDocument;
}

@Injectable()
export class DetailedStatisticsPipeline {
	constructor(
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
	) {}

	/**
	 * Returns the the aggregate
	 */
	aggregate(
		filter: FilterQuery<ReportDocument>,
	): Aggregate<DetailedStatAggregationResult[]> {
		return this.reportModel
			.aggregate()
			.match(filter)
			.group({
				_id: {
					resource_id: '$resource_id',
					curator_orcid: '$curator_orcid',
					league: '$league',
					activity_term: '$activity_term',
				},
				resource_id: {
					$first: '$resource_id',
				},
				curator_orcid: {
					$first: '$curator_orcid',
				},
				league: {
					$first: '$league',
				},
				activity_term: {
					$first: '$activity_term',
				},
				resource: {
					$first: '$resource',
				},
				user: {
					$first: '$user',
				},
				league_data: {
					$first: '$league_data',
				},
				term: {
					$first: '$term',
				},
				privacy: {
					$first: '$privacy',
				},
				count: {
					$sum: 1,
				},
				last_contribution: {
					$max: '$timestamp',
				},
				first_contribution: {
					$min: '$timestamp',
				},
				last_week_count: {
					$sum: {
						$cond: [{ $gt: ['$timestamp', getWeekStart()] }, 1, 0],
					},
				},

				last_month_count: {
					$sum: {
						$cond: [{ $gt: ['$timestamp', getMonthStart()] }, 1, 0],
					},
				},
				last_quarter_count: {
					$sum: {
						$cond: [{ $gt: ['$timestamp', getQuarterStart()] }, 1, 0],
					},
				},
			})
			.sort({
				resource_id: -1,
				curator_orcid: -1,
				league: -1,
				activity_term: -1,
			}) as unknown as Aggregate<DetailedStatAggregationResult[]>;
	}
}
