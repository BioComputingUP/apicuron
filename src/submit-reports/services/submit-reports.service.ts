import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { InsertManyResult, Model } from 'mongoose';
import { SubmitReportDto } from '../dto/submit-report.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
	PRE_REPORT_INSERT,
	POST_REPORT_INSERT,
	PRE_REPORT_INSERT_MANY,
	POST_REPORT_INSERT_MANY,
	REPORTS_DELETED_ALL_RESOURCE,
} from '../../reports/constants';
import { ReportDto } from '../../reports/dto/report.dto';
import { DeleteResult } from 'mongodb';

@Injectable()
export class SubmitReportService {
	constructor(
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
		protected eventEmitter: EventEmitter2,
	) {}

	logger = new Logger(SubmitReportService.name);

	async deleteAllResourcesReports(
		resource_ids: string[],
	): Promise<{ [key: string]: DeleteResult }> {
		// delete all the reports of all resources in order
		const deleteResponses$ = resource_ids.map(async (resource_id: string) => {
			return await this.deleteAllResourceReports(resource_id);
		});

		// await for all promises in order
		const deleteResponses = await Promise.all(deleteResponses$);
		// Create an object where each key is a resource id and the value is the response object;
		return resource_ids.reduce((prev, curr, index) => {
			prev[curr] = deleteResponses[index];
			return prev;
		}, {});
	}

	async deleteAllResourceReports(resource_id: string): Promise<DeleteResult> {
		const { deletedCount, acknowledged } = await this.reportModel.deleteMany({
			resource_id,
		});
		this.eventEmitter.emit(REPORTS_DELETED_ALL_RESOURCE, {
			resource_id,
			deletedCount,
			acknowledged,
		});
		return { deletedCount, acknowledged };
	}

	async insertReport(
		report: SubmitReportDto,
		options = { preventEvents: false },
	) {
		try {
			const instance = new this.reportModel(report);

			await this.eventEmitter.emitAsync(
				PRE_REPORT_INSERT,
				report as ReportDocument,
			);

			await instance.save();

			if (!options.preventEvents) {
				await this.eventEmitter.emitAsync(
					POST_REPORT_INSERT,
					report as ReportDocument,
				);
			}
			return instance;
		} catch (e: any) {
			this.logger.error(e.message, e.stack, 'insertReport');
			throw new Error(`Failed to save Report ${report}`);
		}
	}

	async insertReports(
		reports: ReportDto[],
		options = { preventEvents: false },
	): Promise<Omit<InsertManyResult<Report>, 'insertedIds'>> {
		try {
			const reportDocuments = reports.map(
				(report: ReportDto) => new this.reportModel(report),
			);

			await this.eventEmitter.emitAsync(
				PRE_REPORT_INSERT_MANY,
				reportDocuments,
			);

			const { insertedCount, acknowledged } = await this.reportModel.insertMany(
				reportDocuments,
				{ rawResult: true },
			);
			if (!options.preventEvents) {
				await this.eventEmitter.emitAsync(
					POST_REPORT_INSERT_MANY,
					reports as ReportDto[],
				);
			}
			return {
				insertedCount,
				acknowledged,
			};
		} catch (e: any) {
			this.logger.error(e.message, e.stack, 'insertReports');
			this.logger.error(
				`A MongoBulkWriteException occurred when inserting Reports, but there are successfully processed documents.`,
			);
		}
	}
}
