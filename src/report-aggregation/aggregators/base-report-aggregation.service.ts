import { Injectable } from '@nestjs/common';
import {
	Aggregator,
	SortedPipelineStage,
} from '../interfaces/aggregator.interface';
import { Aggregate, Model, PipelineStage } from 'mongoose';
import { BaseAggregationResult } from '../interfaces/aggregation-results';
import { Report } from '../../core/schemas/reports.schema';

@Injectable()
/**
 * Represents a base report aggregation service.
 * @implements Aggregator<BaseAggregationResult>
 */
export class BaseReportAggregationService
	implements Aggregator<BaseAggregationResult>
{
	operations = [];

	/**
	 * Builds the aggregation pipeline stages.
	 * @returns The list of pipeline stages with the last element sorted
	 */
	buildPipeline(): SortedPipelineStage {
		const pipeline: PipelineStage[] = [];

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
			},
		});

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

	/**
	 * Returns the aggregation pipeline stages for the base aggregation.
	 * @param model - The model to perform the aggregation on.
	 * @returns The aggregated results.
	 */
	aggregate(model: Model<any>): Aggregate<BaseAggregationResult> {
		const pipeline: PipelineStage[] = this.buildPipeline();
		return model.aggregate(
			pipeline,
		) as unknown as Aggregate<BaseAggregationResult>;
	}
}
