import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import {
	Document,
	Model,
	Schema as MongooseSchema,
	SaveOptions,
} from 'mongoose';
import { Term } from './terms.schema';
import { User } from './user.schema';

export type ReportDocument = Report & Document;
@Schema({
	collection: 'reports',
})
export class Report {
	@Prop({
		required: true,
	})
	activity_term: string;

	@Prop({ required: true })
	curator_orcid: string;

	@Prop({ required: true })
	entity_uri: string;

	@Prop({ required: false })
	resource_uri?: string;

	@Prop({ required: true })
	resource_id: string;

	@Prop({
		required: true,
		type: Date,
	})
	timestamp: Date;

	@Prop({
		type: String,
	})
	privacy: 'private' | 'public';
}

const ReportSchema = SchemaFactory.createForClass(Report);

// ReportSchema.virtual('term', {
// 	ref: 'Term',
// 	localField: 'activity_term',
// 	path: 'activity_term',
// 	foreignField: 'activity_term',
// 	justOne: true,
// });
function ReportSchemaFactory(userModel: Model<User>) {
	ReportSchema.pre(
		'insertMany',
		async function (
			next: (err?: NativeError) => void,
			reports: ReportDocument[],
		) {
			const promises$ = reports.map(async (report: ReportDocument) => {
				if (!report.privacy) {
					report.privacy =
						(await userModel.findOne({ orcid_id: report.curator_orcid }))
							?.privacy ?? 'private';
				}
				return;
			});

			await promises$;
			next();
			return;
		},
	);

	ReportSchema.pre('save', async function () {
		if (!this.privacy) {
			this.privacy =
				(await userModel.findOne({ orcid_id: this.curator_orcid }))?.privacy ??
				'private';
		}
		return;
	});

	return ReportSchema;
}
export { ReportSchemaFactory };
