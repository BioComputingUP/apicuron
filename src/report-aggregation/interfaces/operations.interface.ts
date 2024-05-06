import { PipelineStage } from 'mongoose';

export interface Operation {
	map(): PipelineStage[];
	group(): PipelineStage.Group['$group'];
	postGroup(): PipelineStage[];
}
