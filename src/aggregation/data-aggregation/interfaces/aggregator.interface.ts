import { Aggregate, Model, PipelineStage } from 'mongoose';
import { Operation } from './operations.interface';

export type SortedPipelineStage = [...PipelineStage[], PipelineStage.Sort];

export interface Aggregator<T> {
	extendOperations(operations: Operation[]): void;
	buildPipeline(): SortedPipelineStage;
	aggregate(model: Model<any>, ...args: any[]): Aggregate<T>;
}
