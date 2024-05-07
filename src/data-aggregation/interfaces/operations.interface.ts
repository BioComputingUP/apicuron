import { AccumulatorOperator, PipelineStage } from 'mongoose';

export type GroupEntries = { [key: string]: AccumulatorOperator };
export interface Operation {
	map(): PipelineStage[];
	group(): GroupEntries;
	postGroup(): PipelineStage[];
}
