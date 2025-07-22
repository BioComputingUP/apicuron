import { Injectable } from '@nestjs/common';
import { TIMEZONE } from '../../util/date.helper';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, Aggregate } from 'mongoose';
import { ReportModel, Report, ReportDocument } from '../../core/schemas/reports.schema';
import { Term, TermDocument } from '../../core/schemas/terms.schema';
import { AggregatedReportsMonthly } from '../interfaces';

@Injectable()
export class ReportsMonthlyAggregator {
	constructor(
		@InjectModel(Report.name) protected reportModel: ReportModel,
		@InjectModel(Term.name) protected termModel: Model<TermDocument>,
	) {}

	/**
	 * Aggregates the reports based on the provided filter.
	 * @param filter - The filter query to apply to the aggregation.
	 * @returns An `Aggregate` object representing the aggregated reports.
	 */
	aggregate(
		filter: FilterQuery<ReportDocument>,
	): Aggregate<AggregatedReportsMonthly> {
		return this.reportModel
			.aggregate()
			.match(filter)
			.addFields({
				score: '$term.score',
				activity_category: '$term.activity_category',
				month: {
					$month: {
						date: '$timestamp',
						timezone: TIMEZONE,
					},
				},
				year: {
					$year: {
						date: '$timestamp',
						timezone: TIMEZONE,
					},
				},
			})
			.group({
				_id: {
					curator_orcid: '$curator_orcid',
					resource_id: '$resource_id',
					league: '$league',
					activity_term: '$activity_term',
					year: '$year',
					month: '$month',
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
				activity_category: {
					$first: '$activity_category',
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
				year: { $first: '$year' },
				month: { $first: '$month' },
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
				month: -1,
				resource_id: -1,
				curator_orcid: -1,
				league: -1,
				activity_term: -1,
			}) as unknown as Aggregate<AggregatedReportsMonthly>;
	}
}
