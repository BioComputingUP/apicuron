import { Injectable, Scope } from '@nestjs/common';
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
import { AggregateDateBoundsService } from '../operations/aggregate-date-bounds.operation';
import { AggregateDaysService } from '../operations/aggregate-days.operation';
import { AggregateMonthsService } from '../operations/aggregate-months.operation';
import { DetailedAggregationResult } from '../interfaces/aggregation-results';
import { Model, Aggregate } from 'mongoose';
import { Operation } from '../interfaces/operations.interface';

@Injectable({
	scope: Scope.TRANSIENT
})
export class DetailedReportAggregationService
	implements Aggregator<DetailedAggregationResult>
{
	extendOperations(operations: Operation[]): void {
		this.operations = [...operations, ...this.operations];
	}

	private operations = [
		new AggregateDaysService(),
		new AggregateDateBoundsService(),
		new AggregateMonthsService(),
	];
	aggregate(
		model: Model<any>,
		pipelinePrefix: PipelineStage[] = [],
	): Aggregate<DetailedAggregationResult> {
		const pipeline = this.buildPipeline();
		pipeline.unshift(...pipelinePrefix);
		return model.aggregate(
			pipeline,
		) as unknown as Aggregate<DetailedAggregationResult>;
	}

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
