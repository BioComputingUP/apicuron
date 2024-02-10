import { Prop, Schema as SchemaDec, SchemaFactory } from '@nestjs/mongoose';
import { Aggregate, HydratedDocument, Query, Schema } from 'mongoose';
import { ContributionType, PrivacyType } from '../../enums';

export type ReportsMetaDocument = HydratedDocument<ReportsMeta>;

@SchemaDec({
	_id: false,
})
export class ReportsMeta {
	@Prop({
		default: (): ContributionType => ContributionType.community,
		type: String,
		enum: ContributionType,
	})
	contribution_type: ContributionType;

	@Prop({
		type: String,
		required: true,
	})
	privacy: PrivacyType;
}

export const ReportMetaSchema = SchemaFactory.createForClass(ReportsMeta);
type Constructor = new (...args: any[]) => any;

export function AggregatedReportsMixin<TBase extends Constructor>(Base: TBase) {
	class WithReportMeta extends Base {
		@Prop({
			default: (): ContributionType => ContributionType.community,
			type: String,
			enum: ContributionType,
		})
		contribution_type: ContributionType;

		getMetaFields(): ReportsMeta {
			return {
				contribution_type: this.contribution_type,
				privacy: this.privacy,
			};
		}
	}
	return WithReportMeta;
}

export function AggregatedReportsSchemaFactory(
	schema: Schema<any>,
	aggregatedReports: Partial<ReportsMeta> = null,
) {
	schema.add(ReportMetaSchema);

	if (!aggregatedReports) {
		return schema;
	}

	function setReportMetaQuery(next) {
		Object.entries(aggregatedReports).forEach(([key, value]) => {
			this.where(key, value);
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
		schema.pre<Query<ReportsMeta, ReportsMetaDocument>>(
			operation as RegExp | 'insertMany',
			setReportMetaQuery,
		);
	});

	schema.pre<Query<ReportsMeta, ReportsMetaDocument>>(
		'validate',
		{ document: true, query: false },
		function (next) {
			const filter = this.getFilter();
			const entries = Object.entries(aggregatedReports);

			for (const key in entries) {
				if (filter?.[key] != aggregatedReports[key]) {
					throw new Error(
						`Queried Filter in Model: ${this.model.name} does not match Schema imposed Conditions`,
					);
				}
			}

			next();
		},
	);

	schema.pre<Aggregate<ReportsMetaDocument>>('aggregate', function (next) {
		this.pipeline().unshift({ $match: { ...aggregatedReports } });
		next();
	});

	schema.pre('updateMany', setReportMetaQuery);
	return schema;
}
