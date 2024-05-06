import { Injectable } from '@nestjs/common';
import {
	Aggregator,
	SortedPipelineStage,
} from '../interfaces/aggregator.interface';
import { PipelineStage } from 'mongoose';

@Injectable()
export class BaseReportAggregationService implements Aggregator {
	operations = [];

	/**
	 * Returns the aggregation pipeline stages for the base aggregation
	 */
	aggregate(): SortedPipelineStage {
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
}
