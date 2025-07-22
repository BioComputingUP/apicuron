import { PipelineStage } from 'mongoose';

export type PaginationAggregation = [PipelineStage.Skip?, PipelineStage.Limit?];
