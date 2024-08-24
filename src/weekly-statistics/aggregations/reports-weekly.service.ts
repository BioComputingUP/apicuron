import {
	AccumulatorOperator,
	Aggregate,
	FilterQuery,
	Model,
	PipelineStage,
} from 'mongoose';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { DaysOfWeek, DayOfWeek } from '../../core/enums';
import { Term, TermDocument } from '../../core/schemas/terms.schema';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { getLastWeekDate } from '../../util/date.helper';

export interface AggregatedReportsWeekly {
	resource_id: string;
	curator_orcid: string;
	league: string;
	activity_term: string;
	activity_category: string;
	count: number;
	score: number;
	total_score: number;
	privacy: string;
	first_contribution: Date;
	last_contribution: Date;
	days: Array<number>;
}

@Injectable()
/**
 * Represents a pipeline for weekly aggregation reports.
 */
export class ReportsWeeklyAggregationPipeline implements OnModuleInit {
	addDaysArrayStage: PipelineStage.AddFields['$addFields'];
	removeDayPropertiesStage: PipelineStage.Project['$project'];
	addDayPropertiesStage: { [k: string]: Record<string, any> };
	dayGroupFields: { [k: string]: AccumulatorOperator };
	constructor(
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
		@InjectModel(Term.name) protected termModel: Model<TermDocument>,
	) {}

	onModuleInit() {
		this.addDaysArrayStage = {
			days: DaysOfWeek.map((day) => `$${day}`),
		};

		this.removeDayPropertiesStage = Object.fromEntries(
			DaysOfWeek.map((day) => [day, 0]),
		);

		this.addDayPropertiesStage = Object.fromEntries(
			DaysOfWeek.map(
				(day, index): [DayOfWeek, PipelineStage.AddFields['$addFields']] => {
					return [
						day,
						{
							$cond: {
								if: {
									$eq: [{ $dayOfWeek: '$timestamp' }, index + 1],
								},
								then: 1,
								else: 0,
							},
						},
					];
				},
			),
		);

		this.dayGroupFields = Object.fromEntries<AccumulatorOperator>(
			DaysOfWeek.map(
				(day: DayOfWeek) =>
					[day, { $sum: `$${day}` }] as [DayOfWeek, AccumulatorOperator],
			),
		);
	}

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
			.match({
				timestamp: { $gte: getLastWeekDate() },
			})
			.lookup({
				from: this.termModel.collection.name,
				localField: 'activity_term',
				foreignField: 'activity_term',
				as: 'term',
			})
			.unwind({ path: '$term' })
			.addFields({
				...this.addDayPropertiesStage,
				score: '$term.score',
				activity_category: '$term.activity_category',
			})
			.project({ term: 0 })
			.group({
				_id: {
					curator_orcid: '$curator_orcid',
					resource_id: '$resource_id',
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
				activity_category: {
					$first: '$activity_category',
				},
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
				...this.dayGroupFields,
			})
			.addFields(this.addDaysArrayStage)
			.project(this.removeDayPropertiesStage)
			.sort({
				resource_id: -1,
				curator_orcid: -1,
				league: -1,
				activity_term: -1,
			}) as unknown as Aggregate<AggregatedReportsWeekly>;
	}
}
