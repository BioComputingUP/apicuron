import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ResourceStatsDocument = HydratedDocument<ResourceStats>;

@Schema()
export class ResourceStats {
	@Prop({ required: true })
	resource_id: string;

	@Prop({ default: 0, required: true })
	contribution_count: number;

	@Prop({ default: 0, required: true })
	uniqueContributors: number;

	@Prop({ required: false })
	lastSubmissionDate?: Date;

	@Prop({ required: false })
	firstSubmissionDate?: Date;

	@Prop({ defualt: 0, required: true })
	lastDayContributionCount: number;

	@Prop({ default: 0, required: true })
	lastWeekContributionCount: number;
}

export const ResourceStatsSchema = SchemaFactory.createForClass(ResourceStats);
