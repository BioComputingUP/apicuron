import { Aggregate, Model, PipelineStage } from 'mongoose';

export type SortedPipelineStage = [...PipelineStage[], PipelineStage.Sort];

export interface Aggregator<T> {
	buildPipeline(): SortedPipelineStage;
	aggregate(model: Model<any>, ...args: any[]): Aggregate<T>;
}
