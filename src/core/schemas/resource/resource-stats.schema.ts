import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ResourceStatsDocument = HydratedDocument<ResourceStats>;

@Schema()
export class ResourceStats {
	@Prop({ required: true })
	resource_id: string;

	@Prop({ default: 0, required: true })
	contributionCount: number;

	@Prop({ default: 0, required: true })
	uniqueContributors: number;

	@Prop({ required: false })
	lastContributionDate?: Date;

	@Prop({ required: false })
	firstContributionDate?: Date;

	@Prop({ required: false })
	lastResourceUpdateDate?: Date;
}

export const ResourceStatsSchema = SchemaFactory.createForClass(ResourceStats);
