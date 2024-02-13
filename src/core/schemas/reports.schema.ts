import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PrivacyType } from '../enums';
import { ResourceEntity } from './components/resource-entity.schema';

export type ReportDocument = HydratedDocument<Report>;
@Schema({
	collection: 'reports',
})
export class Report extends ResourceEntity {
	@Prop({
		required: true,
	})
	activity_term: string;

	@Prop({ required: true, type: String })
	curator_orcid: string;

	@Prop({ required: true })
	entity_uri: string;

	@Prop({ required: false })
	resource_uri?: string;

	@Prop({
		required: true,
		type: Date,
	})
	timestamp: Date;

	getMetaFields() {
		return {
			privacy: this.privacy,
		};
	}
}

const ReportSchema = SchemaFactory.createForClass(Report).loadClass(Report);
// const logger = new Logger(ReportSchemaFactory.name);

// export function ReportSchemaFactory(eventEmitter: EventEmitter2) {
// 	ReportSchema.pre('save', async function () {
// 		try {
// 			await eventEmitter.emitAsync(PRE_REPORT_INSERT, this);
// 		} catch (err: any) {
// 			if (err instanceof Error) {
// 				logger.error(err.message, err.stack, err.name);
// 				throw new Error('Error occured on Report pre middleware ');
// 			}
// 		}
// 	});

// 	ReportSchema.post('save', async function () {
// 		try {
// 			await eventEmitter.emitAsync(POST_REPORT_INSERT, this);
// 		} catch (err: any) {
// 			if (err instanceof Error) {
// 				logger.error(err.message, err.stack, err.name);
// 				throw new Error('Error occured on Report pre middleware ');
// 			}
// 		}
// 	});

// 	ReportSchema.pre(
// 		'insertMany',
// 		function (this, next, docs: ReportDocument | ReportDocument[]) {
// 			eventEmitter
// 				.emitAsync(PRE_REPORT_INSERT_MANY, docs)
// 				.then(() => {
// 					next();
// 				})
// 				.catch((err) => {
// 					next(err);
// 				});
// 		},
// 	);

// 	ReportSchema.post('insertMany', function (this, data, next) {
// 		eventEmitter
// 			.emitAsync(POST_REPORT_INSERT_MANY, data)
// 			.then(() => {
// 				next();
// 			})
// 			.catch((err) => {
// 				next(err);
// 			});
// 	});

// 	return ReportSchema;
// }

export { ReportSchema };
