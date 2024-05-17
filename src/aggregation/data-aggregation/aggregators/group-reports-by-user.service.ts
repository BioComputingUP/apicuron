import { Injectable, Scope } from '@nestjs/common';
import {
	Aggregator,
	SortedPipelineStage,
} from '../interfaces/aggregator.interface';
import { Model, Aggregate, PipelineStage } from 'mongoose';
import { Operation } from '../interfaces/operations.interface';
import { ReportDocument } from '../../../core/schemas/reports.schema';
import { AggregatedUserReportsByActivities } from '../interfaces/aggregation-results';

@Injectable({
	scope: Scope.TRANSIENT
})
export class GroupReportsByUserAggregationService
	implements Aggregator<AggregatedUserReportsByActivities>
{
	extendOperations(operations: Operation[]): void {
		this.operations = [...this.operations, ...operations];
	}

	operations: Operation[] = [];

	buildPipeline(): SortedPipelineStage {
		const pipeline: PipelineStage[] = [];

		pipeline.push({
			$group: {
				_id: '$curator_orcid',
				count: { $sum: 1 },
				resource_id: { $first: '$resource_id' },
				activity_terms: { $addToSet: '$activity_term' },
				privacy: { $first: '$privacy' },
				league: { $first: '$league' },
				curator_orcid: { $first: '$curator_orcid' },
			},
		});

		const sortStage: PipelineStage.Sort = {
			$sort: {
				resource_id: -1,
				league: -1,
				curator_orcid: -1,
			},
		};

		return [...pipeline, sortStage];
	}
	aggregate(
		model: Model<ReportDocument>,
		pipelinePrefix: PipelineStage[] = [],
	): Aggregate<AggregatedUserReportsByActivities> {
		const pipeline = this.buildPipeline();
		pipeline.unshift(...pipelinePrefix);
		return model.aggregate(
			pipeline,
		) as unknown as Aggregate<AggregatedUserReportsByActivities>;
	}
}
