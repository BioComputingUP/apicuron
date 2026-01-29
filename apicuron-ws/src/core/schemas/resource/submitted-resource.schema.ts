import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
	FilterQuery,
	HydratedDocument,
	LeanDocument,
	Model,
	ProjectionType,
	QueryOptions,
} from 'mongoose';
import { ResourceCategories, ResourceCategory } from '../../enums';
import { GitRepository } from '../components/git-repository.schema';
import { isCategory, requiresGithubRepo } from './resource-category.schema';

export type SubmittedResourceDocument = HydratedDocument<SubmittedResource>; // this class defines a partnerSubmittedResource that has been validated and has the ability to have Models, Badges and so on
export type SubmittedResourceModel = Model<SubmittedResource>;
export type LeanSubmittedResourceDoc = LeanDocument<SubmittedResource>;
export type SubmittedResourceFilter = FilterQuery<SubmittedResource>;
export type SubmittedResourceProjection = ProjectionType<SubmittedResource>;
export type SubmittedResourceQueryOptions = QueryOptions<SubmittedResource>;

@Schema()
export class SubmittedResource {
	// @Prop({ required: true, unique: true })
	// id: string;
	@Prop()
	resource_description: string;

	@Prop({ required: true })
	resource_id: string;

	@Prop()
	resource_long_name: string;

	@Prop({ required: true, unique: true })
	resource_name: string;

	@Prop({ required: true, unique: true })
	resource_uri: string;

	@Prop({ required: true, unique: true })
	resource_url: string;

	@Prop({ type: Date, required: true, default: Date.now() })
	created_at: Date;

	@Prop({ type: String, required: true })
	logo: string;

	@Prop({ type: String, required: true })
	color: string;

	@Prop({ type: String })
	creator: string;

	@Prop({
		type: String,
		required: true,
		default: ResourceCategory.DatabaseResource,
		enum: ResourceCategories,
	})
	category: ResourceCategory;

	@Prop({
		type: GitRepository,
		required: requiresGithubRepo()
	})
	repository: GitRepository;

	state: string;

	updated_at: Date;
}

export const SubmittedResourceSchema =
	SchemaFactory.createForClass(SubmittedResource);
