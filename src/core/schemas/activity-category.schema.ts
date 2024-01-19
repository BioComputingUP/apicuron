import { Prop } from '@nestjs/mongoose';
import { Aggregate, HydratedDocument, Query, Schema } from 'mongoose';

// export const ContributionTypes = <const>['community', 'professional'];
export enum ContributionType {
	community = 'community',
	professional = 'professional',
}

export enum PrivacyType {
	private = 'private',
	public = 'public',
}
export type ActivityCategoryDocuemnt = HydratedDocument<ActivityCategory>;

export class ActivityCategory {
	@Prop({
		type: String,
		enum: PrivacyType,
	})
	privacy: PrivacyType;

	@Prop({
		default: (): ContributionType => ContributionType.community,
		type: String,
		enum: ContributionType,
	})
	contribution_type: ContributionType;
}

export function ActivityCategorySchemaFactory(
	activityCategory: Partial<ActivityCategory>,
	schema: Schema<any>,
) {
	function setActivityCategoryQuery(next) {
		const filter = this.getFilter();
		this.setQuery({
			...filter,
			...activityCategory,
		});
		next();
	}

	// for each middleware event that has a getFilter() and setQuery() functions in the Query object
	// we assing the function setActivityCategoryQuery as a pre middleware
	[
		'count',
		'find',
		'findOne',
		'updateOne',
		'updateMany',
		'findOneAndDelete',
		'findOneAndRemove',
		'findOneAndReplace',
		'findOneAndUpdate',
	].forEach((operation: string) => {
		schema.pre<Query<ActivityCategory, ActivityCategoryDocuemnt>>(
			operation as RegExp | 'insertMany',
			setActivityCategoryQuery,
		);
	});

	schema.pre<Query<ActivityCategory, ActivityCategoryDocuemnt>>(
		'validate',
		{ document: true, query: false },
		function (next) {
			const filter = this.getFilter();
			const entries = Object.entries(activityCategory);

			for (const key in entries) {
				if (filter?.[key] != activityCategory[key]) {
					throw new Error(
						`Queried Filter in Model: ${this.model.name} does not match Schema imposed Conditions`,
					);
				}
			}

			next();
		},
	);

	schema.pre<Aggregate<ActivityCategoryDocuemnt>>('aggregate', function (next) {
		this.pipeline().unshift({ $match: activityCategory });
		next();
	});

	schema.pre('updateMany', setActivityCategoryQuery);

	return schema;
}
