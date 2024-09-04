import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { InsertManyResult, Model } from 'mongoose';
import { SubmitReportDto, SubmitReportsDto } from '../dto/submit-report.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DeleteResult } from 'mongodb';
import {
	IAllResourceReportsDeletedEventPayload,
	IManyReportsSubmittedEventPayload,
	IReportSubmittedEventPayload,
	AllResourceReportsDeletedEvent,
	ManyReportsSubmittedEvent,
	ReportSubmittedEvent,
} from '../events/events';

import { MongoServerError } from 'mongodb';
import { ReportValidatorService } from './report-validator.service';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';

@Injectable()
export class SubmitReportService {
	constructor(
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
		protected eventEmitter: EventEmitter2,
		protected resourceService: PartnerResourcesService,
		protected reportValidator: ReportValidatorService,
	) {}

	logger = new Logger(SubmitReportService.name);

	async deleteAllManyResourcesReports(
		resource_ids: string[],
	): Promise<{ [key: string]: DeleteResult }> {
		// validate that all resource_ids are valid

		// delete all the reports of all resources in order
		const deleteResponses = [];
		for (const [index, resource_id] of resource_ids.entries()) {
			try {
				const deleteResponse = await this.deleteAllResourceReports(resource_id);
				deleteResponses.push(deleteResponse);
			} catch (err) {
				if (err instanceof BadRequestException) {
					throw new BadRequestException(
						`Error deleteing resource_id at index:${index}: ${err.message}`,
					);
				}
			}
		}

		// await for all promises in order
		// Create an object where each key is a resource id and the value is the response object;
		return resource_ids.reduce((prev, curr, index) => {
			prev[curr] = deleteResponses[index];
			return prev;
		}, {});
	}

	/**
	 * Deletes all resource reports for a given resource ID.
	 *
	 * @param resource_id - The ID of the resource.
	 * @returns A promise that resolves to a DeleteResult object containing the number of deleted documents and an acknowledgement flag.
	 * @throws BadRequestException if the resource with the given ID does not exist.
	 */
	async deleteAllResourceReports(resource_id: string): Promise<DeleteResult> {
		const resource = await this.resourceService.get_resource(resource_id);
		if (!resource) {
			throw new BadRequestException(
				`cannot delete reports for resource_id "${resource_id}", the resource does not exist`,
			);
		}

		const { deletedCount, acknowledged } = await this.reportModel.deleteMany({
			resource_id,
		});
		await this.eventEmitter.emitAsync(AllResourceReportsDeletedEvent, {
			resource_id,
		} as IAllResourceReportsDeletedEventPayload);
		return { deletedCount, acknowledged };
	}

	async insertReport(
		submittedReport: SubmitReportDto,
		options = { preventEvents: false },
	): Promise<{ report: ReportDocument; callback?: () => any | Promise<any> }> {
		try {
			const { resource, user, term, report } =
				await this.reportValidator.validateReport(submittedReport);
			await report.save();

			const emitEvent = async () => {
				await this.eventEmitter.emitAsync(ReportSubmittedEvent, {
					report: report,
					user,
					resource,
					term,
				} as IReportSubmittedEventPayload);
			};
			if (!options.preventEvents) {
				await emitEvent();
			}
			return { report, callback: emitEvent };
		} catch (error: any) {
			if (error instanceof MongoServerError && error.code === 11000) {
				this.logger.error(`Attempt at duplicate report insertion`);
				// Duplicate key error, return 403
				const error = new Error(
					`Report from user ${submittedReport.curator_orcid} to resource ${
						submittedReport.resource_id
					} with the exact timestamp ${submittedReport.timestamp.toISOString()} already exists`,
				);
				throw new BadRequestException('Duplicate report submission attempt', {
					cause: error,
					description: error.message,
				});
			}
			if (error instanceof BadRequestException) {
				throw error;
			}
			this.logger.error(error.message, error.stack, 'insertReport');
			throw new Error(`Failed to save Report ${submittedReport}`);
		}
	}

	async insertReports(
		reportSubmission: SubmitReportsDto,
		options = { preventEvents: false },
	): Promise<
		Omit<InsertManyResult<Report>, 'insertedIds'> & {
			reports: ReportDocument[];
			deletedReports: { [keyof: string]: DeleteResult };
			callback?: () => any | Promise<any>;
		}
	> {
		try {
			const validatedReports = await this.reportValidator.validateReports(
				reportSubmission.reports,
			);

			let deleteResponses = {};
			if (reportSubmission.delete_all) {
				deleteResponses = await this.deleteAllManyResourcesReports(
					reportSubmission.delete_all,
				);
			}

			const reportDocuments = validatedReports.map(
				(reportEntry) => reportEntry.report,
			);

			const { insertedCount, acknowledged } = await this.reportModel.insertMany(
				reportDocuments,
				{ rawResult: true },
			);
			const emitEvent = async () => {
				await this.eventEmitter.emitAsync(ManyReportsSubmittedEvent, {
					reports: reportDocuments,
					users: validatedReports.map((r) => r.user),
					resources: validatedReports.map((r) => r.resource),
					terms: validatedReports.map((r) => r.term),
				} as IManyReportsSubmittedEventPayload);
			};

			if (!options.preventEvents) {
				await emitEvent();
			}

			return {
				insertedCount,
				acknowledged,
				reports: reportDocuments,
				deletedReports: deleteResponses,
				callback: options.preventEvents ? emitEvent : undefined,
			};
		} catch (err: any) {
			if (err instanceof MongoServerError && err.code === 11000) {
				this.logger.error(`Attempt at duplicate report insertion`);
				// Duplicate key error, return 403
				const error = new Error(`Duplicate report submission attempt`);
				throw new BadRequestException('Duplicate report submission attempt', {
					cause: error,
					description: error.message,
				});
			}
			if (err instanceof BadRequestException) {
				throw err;
			}
			if (err instanceof Error) {
				this.logger.error(err.message, err.stack, err.name);

				throw new InternalServerErrorException(
					'An internal error occured when submitting the reports',
				);
			}
		}
	}
}
