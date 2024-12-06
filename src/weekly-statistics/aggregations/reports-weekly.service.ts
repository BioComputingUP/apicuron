import { Aggregate, FilterQuery, Model } from 'mongoose';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { Term, TermDocument } from '../../core/schemas/terms.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TIMEZONE } from 'src/util/date.helper';
import {
	LeagueDocument,
	PartnerResourceDocument,
	UserDocument,
} from '../../core/schemas';

export interface AggregatedReportsWeekly {
	resource_id: string;
	curator_orcid: string;
	league: string;
	activity_term: string;
	year: number;
	week: number;
	activity_category: string;
	count: number;
	score: number;
	total_score: number;
	privacy: string;
	first_contribution: Date;
	last_contribution: Date;
	resource: PartnerResourceDocument;
	user: UserDocument;
	league_data: LeagueDocument;
	term: TermDocument;
}

@Injectable()
/**
 * Represents a pipeline for weekly aggregation reports.
 */
export class ReportsWeeklyAggregationPipeline {
	constructor(
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
		@InjectModel(Term.name) protected termModel: Model<TermDocument>,
	) {}

	/**
	 * Aggregates the reports based on the provided filter.
	 * @param filter - The filter query to apply to the aggregation.
	 * @returns An `Aggregate` object representing the aggregated reports.
	 */
	aggregate(
		filter: FilterQuery<ReportDocument>,
	): Aggregate<AggregatedReportsWeekly> {
		return this.reportModel
			.aggregate()
			.match(filter)
			.addFields({
				score: '$term.score',
				activity_category: '$term.activity_category',
				week: {
					$isoWeek: {
						date: '$timestamp',
						timezone: TIMEZONE,
					},
				},
				year: {
					$isoWeekYear: {
						date: '$timestamp',
						timezone: TIMEZONE,
					},
				},
			})
			.project({ term: 0 })
			.group({
				_id: {
					curator_orcid: '$curator_orcid',
					resource_id: '$resource_id',
					league: '$league',
					activity_term: '$activity_term',
					year: '$year',
					week: '$week',
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
				activity_category: {
					$first: '$activity_category',
				},
				year: { $first: '$year' },
				week: { $first: '$week' },
				count: {
					$sum: 1,
				},
				score: {
					$first: '$score',
				},
				total_score: {
					$sum: '$score',
				},
				privacy: {
					$first: '$privacy',
				},
				first_contribution: { $min: '$timestamp' },
				last_contribution: { $max: '$timestamp' },
			})
			.sort({
				year: -1,
				week: -1,
				resource_id: -1,
				curator_orcid: -1,
				league: -1,
				activity_term: -1,
			}) as unknown as Aggregate<AggregatedReportsWeekly>;
	}
}
