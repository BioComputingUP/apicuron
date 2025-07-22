import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult } from 'mongodb';
import { InsertManyResult, Model } from 'mongoose';
import {
	ReportModel,
	ReportDocument,
	Report,
} from '../../core/schemas/reports.schema';
import { SubmitReportDto, SubmitReportsDto } from '../dto/submit-report.dto';
import {
	AllResourceReportsDeletedEvent,
	IAllResourceReportsDeletedEventPayload,
	IManyReportsSubmittedEventPayload,
	IReportSubmittedEventPayload,
	ManyReportsSubmittedEvent,
	ReportSubmittedEvent,
} from '../events/events';

import { MongoServerError } from 'mongodb';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import { ReportValidatorService } from './report-validator.service';
type InsertManyReportsResult = Omit<InsertManyResult<Report>, 'insertedIds'> & {
	reports: Report[];
	deletedReports: { [keyof: string]: DeleteResult };
	callback: () => void | Promise<void>;
};
type InsertReportResult = {
	report: Report;
	callback: () => void | Promise<void>;
};

type InsertOptions<def extends boolean = false> = { preventEvents: def };
@Injectable()
export class SubmitReportService {
	constructor(
		@InjectModel(Report.name) protected reportModel: ReportModel,
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
		const deleteResponses: DeleteResult[] = [];
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
		options?: { preventEvents: true },
	): Promise<InsertReportResult>;
	async insertReport(
		submittedReport: SubmitReportDto,
		options?: { preventEvents: false },
	): Promise<Omit<InsertReportResult, 'callback'>>;
	async insertReport(
		submittedReport: SubmitReportDto,
		options: { preventEvents: boolean } = { preventEvents: false },
	): Promise<InsertReportResult> {
		try {
			const { resource, user, term, report, league_data } =
				await this.reportValidator.validateReport(submittedReport);
			await this.reportModel.create(report);

			const emitEvent = async () => {
				const payload: IReportSubmittedEventPayload = {
					report: report,
					user,
					resource,
					term,
					league_data,
				};
				await this.eventEmitter.emitAsync(ReportSubmittedEvent, payload);
			};
			if (!options.preventEvents) {
				await emitEvent();
			}
			return { report, callback: emitEvent };
		} catch (error) {
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
		submission: SubmitReportsDto,
		options?: InsertOptions<true>,
	): Promise<InsertManyReportsResult>;
	async insertReports(
		submission: SubmitReportsDto,
		options?: InsertOptions,
	): Promise<Omit<InsertManyReportsResult, 'callback'>>;
	async insertReports(
		submission: SubmitReportsDto,
		options: InsertOptions<boolean> = {
			preventEvents: false,
		},
	): Promise<
		InsertManyReportsResult | Omit<InsertManyReportsResult, 'callback'>
	> {
		try {
			const validatedReports = await this.reportValidator.validateReports(
				submission.reports,
			);

			let deleteResponses = {};
			if (submission.delete_all) {
				deleteResponses = await this.deleteAllManyResourcesReports(
					submission.delete_all,
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
					users: validatedReports.map((r) => r?.user),
					resources: validatedReports.map((r) => r.resource),
					terms: validatedReports.map((r) => r.term),
				} as IManyReportsSubmittedEventPayload);
			};

			const resultBase = {
				insertedCount,
				acknowledged,
				reports: reportDocuments,
				deletedReports: deleteResponses,
			};

			if (!options.preventEvents) {
				await emitEvent();
				return resultBase;
			} else {
				return {
					...resultBase,
					callback: emitEvent,
				};
			}
		} catch (err) {
			if (!err || !(err instanceof Error)) {
				this.logger.error(
					`An unknown error occurred during report insertion`,
					err,
				);
				return;
			}
			if (err instanceof MongoServerError && err.code === 11000) {
				this.logger.error(`Attempt at duplicate report insertion`);
				// Duplicate key error, return 403
				throw err;
			}
			if (err instanceof BadRequestException) {
				throw err;
			}

			this.logger.error(err.message, err.stack, err.name);

			throw new InternalServerErrorException(
				'An internal error occured when submitting the reports',
			);
		}
	}
}
