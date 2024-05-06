import { PipelineStage } from 'mongoose';

export type SortedPipelineStage = [...PipelineStage[], PipelineStage.Sort];

export interface Aggregator {
	aggregate(): SortedPipelineStage;
}
