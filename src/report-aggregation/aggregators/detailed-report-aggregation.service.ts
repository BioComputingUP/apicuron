import { Injectable } from '@nestjs/common';
import {
	Aggregator,
	SortedPipelineStage,
} from '../interfaces/aggregator.interface';
import { PipelineStage } from 'mongoose';
import {
	runMapOperations,
	runGroupOperations,
	runPostGroupOperations,
} from '../helper/aggregator-helper';
import { AggregateDateBoundsService } from '../operations/aggregate-date-bounds.service';
import { AggregateDaysService } from '../operations/aggregate-days.service';
import { AggregateMonthsService } from '../operations/aggregate-months.service';
import { DetailedAggregationResult } from '../interfaces/aggregation-results';
import { Model, Aggregate } from 'mongoose';

@Injectable()
export class DetailedReportAggregationService
	implements Aggregator<DetailedAggregationResult>
{
	constructor(
		protected aggregateDays: AggregateDaysService,
		protected aggregateDates: AggregateDateBoundsService,
		protected aggregateMonths: AggregateMonthsService,
	) {}
	aggregate(model: Model<any>): Aggregate<DetailedAggregationResult> {
		const pipeline = this.buildPipeline();
		return model.aggregate(
			pipeline,
		) as unknown as Aggregate<DetailedAggregationResult>;
	}

	private operations = [this.aggregateDays, this.aggregateDates];

	/**
	 * Returns the aggregation pipeline stages for the base aggregation
	 */
	buildPipeline(): SortedPipelineStage {
		const pipeline: PipelineStage[] = [];

		const mapOperations = runMapOperations(this.operations);

		pipeline.push(...mapOperations);

		const groups = runGroupOperations(this.operations);

		// Group the documents by the days of the week
		pipeline.push({
			$group: {
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
				count: {
					$sum: 1,
				},
				...groups,
			},
		});

		const postGroups = runPostGroupOperations(this.operations);
		// Post-grouping operations
		pipeline.push(...postGroups);

		const sortStage: PipelineStage.Sort = {
			$sort: {
				resource_id: -1,
				curator_orcid: -1,
				league: -1,
				activity_term: -1,
			},
		};

		return [...pipeline, sortStage];
	}
}
