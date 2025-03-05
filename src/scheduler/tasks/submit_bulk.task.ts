import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
	SubmitReportDto,
	SubmitReportsDto,
} from '../../submit-reports/dto/submit-report.dto';

import * as StreamObject from 'stream-json/streamers/StreamObject';
import { createReadStream, readFileSync } from 'fs';
import { filter } from 'stream-json/filters/Filter';
import { parser } from 'stream-json';
import { Stream, chain } from 'stream-chain';
import { pick } from 'stream-json/filters/Pick';
import * as StreamArray from 'stream-json/streamers/StreamArray';
import { validate, ValidationError } from 'class-validator';
import { User, UserDocument } from '../../core/schemas/user.schema';
import { NotificationsService } from '../../notifications/notifications.service';
import { TaskArgument } from '../../scheduler-client/types/baseTask';
import { InjectModel } from '@nestjs/mongoose';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { Model } from 'mongoose';
import { plainToClass, plainToInstance } from 'class-transformer';
import { MongoBulkWriteError } from 'mongodb';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SubmitReportService } from '../../submit-reports/services/submit-reports.service';
import { BulkSubmissionEvent } from '../../submit-reports/events/events';
import { partition } from 'lodash';
import { UserRepository } from '../../core/repositories/user.repository';

export type ValidatedReport = {
	report: SubmitReportDto;
	errors: ValidationError[];
};
export type SubmissionProcessingReport = {
	errors: ValidationError[];
	success_count: number;
	total_report_count: number;
	resource_ids: string[];
};

@Injectable()
export class SubmitBulkTask {
	constructor(
		// protected reportService: ReportsService,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
		protected userModel: UserRepository,
		protected notificationsService: NotificationsService,
		protected eventEmitter: EventEmitter2,
		protected submitReports: SubmitReportService,
	) {}

	logger = new Logger(SubmitBulkTask.name);

	public async run_task(task_arg: TaskArgument) {
		const file = task_arg.file;

		const [orcid_id, delete_all] = task_arg.arguments;

		if (delete_all && typeof delete_all == 'string') {
			this.logger.log(
				`User specified resources ${delete_all} to be deleted before proceeding`,
			);
			const resources_delete_all: string[] = delete_all.split(',');

			this.logger.log(`User specified resources ${delete_all}`);

			for (let i = 0; i < resources_delete_all.length; i++) {
				const currentResourceId = resources_delete_all[i];
				const response = await this.reportModel.deleteMany({
					resource_id: currentResourceId,
				});
				this.logger.log(
					`Deleted ${response.deletedCount} reports from resource ${resources_delete_all[i]} before proceeding`,
				);
			}
		}
		// const fileStats = statSync(file);
		// if (fileStats.size > 1024 * 50 /* size in bytes */) {
		return await this.main(file, orcid_id);
		// }
		// return await this.unbuffered_submission(file, orcid_id);
	}

	public async unbuffered_submission(file: string, submitter_orcid: string) {
		const user = await this.userModel.findOne({ orcid_id: submitter_orcid });

		const rawData = await this.loadRawData(file, submitter_orcid);

		const reports = this.loadReportsArray(rawData);
		const defaultReport = this.loadDefaultReport(rawData);

		const reportProcessing$ = reports.map(
			async (reportEntry): Promise<ValidatedReport> => {
				const report = { ...defaultReport, ...reportEntry };
				const reportObj = plainToClass(SubmitReportDto, report);

				const reportValidation: ValidatedReport = await this.validate_report(
					reportObj,
				);

				const priviledgeValidationErrors = this.check_submission_priviledge(
					user,
					report,
				);
				if (priviledgeValidationErrors) {
					reportValidation.errors.push(priviledgeValidationErrors);
				}
				return reportValidation;
			},
		);

		const processedReports = await Promise.allSettled(reportProcessing$);

		const sucessfullyProcessedReports = (
			processedReports.filter(
				(reportOutcome) => reportOutcome.status === 'fulfilled',
			) as PromiseFulfilledResult<ValidatedReport>[]
		).map((reportOutcome) => reportOutcome.value);

		const [validReports, invalidReports] = partition(
			sucessfullyProcessedReports,
			(validatedReport: ValidatedReport) => validatedReport.errors.length === 0,
		);

		this.logger.debug(`Processed ${processedReports.length} reports`);
		this.logger.debug(`${validReports.length} Valid to be inserted, reports`);
		this.logger.debug(`${invalidReports.length} Invalid, reports`);

		const affected_resource_ids = validReports
			.map((report) => report.report.resource_id)
			.reduce((acc, resource_id) => acc.add(resource_id), new Set<string>());

		const reportsToSave: SubmitReportDto[] = validReports.map(
			(validatedReport) => validatedReport.report,
		);

		const reportSubmission = plainToInstance(SubmitReportsDto, {
			reports: reportsToSave,
		});

		try {
			const insertResult = await this.submitReports.insertReports(
				reportSubmission,
			);

			const insertCount = insertResult.insertedCount ?? 0;
			this.logger.debug(`inserted ${insertCount} reports`);

			const successCount = validReports.length;
			const errors = invalidReports
				.map((outcome: ValidatedReport) => outcome.errors)
				.flat();
			const totalCount = processedReports.length;

			const notification_body = this.build_notification_body(
				errors,
				successCount,
				totalCount,
			);

			await this.notificationsService.create_user_notification(
				'Submission report',
				notification_body,
				submitter_orcid,
			);
			if (successCount > 0) {
				await this.eventEmitter.emitAsync(
					BulkSubmissionEvent.name,
					new BulkSubmissionEvent(
						submitter_orcid,
						Array.from(affected_resource_ids),
					),
				);
			}
		} catch (err: any) {
			if (err instanceof MongoBulkWriteError) {
				this.logger.error(err.message, err.stack, err.name);
				if (err.code === 11000) {
					this.notificationsService.create_user_notification(
						'Submission Failed',
						'Error inserting reports ,Duplicate Reports Error',
						submitter_orcid,
					);
					return;
				}
				this.notificationsService.create_user_notification(
					'Submission Failed',
					'Error inserting reports, Unknown Error Please contact us at info@apicuron.org for assistance',
					submitter_orcid,
				);
			}
			if (err instanceof BadRequestException) {
				this.notificationsService.create_user_notification(
					'Submission Failed',
					`Error inserting reports, Bad Reports ${err.message}`,
					submitter_orcid,
				);
			}
		}
	}

	private async loadRawData(filePath: string, submitter_orcid: string) {
		try {
			const rawData = readFileSync(filePath);
			const submission = JSON.parse(rawData.toString()); // Convert Buffer to string before parsing as JSON

			return submission;
		} catch (err: any) {
			if (err instanceof SyntaxError) {
				this.logger.error(
					`Error Parsing JSON file ${filePath} submitted by ${submitter_orcid}`,
				);
				this.logger.error(err.message, err.stack, err.name);
				await this.notificationsService.create_user_notification(
					'Submission Failed',
					`Error parsing submitted JSON file, invalid JSON`,
					submitter_orcid,
				);
				throw new Error('Error Parsing JSON File');
			}
			if (err instanceof Error) {
				this.logger.error(
					`JSON file not found or invalid: ${filePath} submitted by ${submitter_orcid}`,
				);
				this.logger.error(err.message, err.stack, err.name);

				await this.notificationsService.create_user_notification(
					'Submission Failed',
					`Internal Error occured, please contact us for assistance at info@apicuron.org`,
					submitter_orcid,
				);
				throw new Error('JSON file not found or invalid');
			}
			this.logger.error('Unknown Error occured');
			await this.notificationsService.create_user_notification(
				'Submission Failed',
				`Internal Error occured, please contact us for assistance at info@apicuron.org`,
				submitter_orcid,
			);
			throw new Error(err);
		}
	}

	private loadDefaultReport(data: any) {
		const defaultReportKeys = Object.keys(data).filter(
			(key: string) => key !== 'reports',
		);

		const result = {};
		for (const key of defaultReportKeys) {
			result[key] = data[key];
		}

		return result;
	}

	private loadReportsArray(data: any): any[] {
		const reports = data['reports'];

		if (reports instanceof Array) {
			return reports;
		}
		return [];
	}

	private async main(file: string, submitter_orcid: string) {
		let reportStream = null;
		try {
			const defaultReport = await this.parse_default_report(file);
			const user = await this.userModel.findOne({
				orcid_id: submitter_orcid,
			});
			if (!user) {
				throw new Error(
					`User with the ORCID ID ${submitter_orcid} does not exist`,
				);
			}
			reportStream = this.build_report_stream(file, defaultReport, user);
		} catch (e) {
			await this.notificationsService.create_user_notification(
				'Submission Failed',
				`Error: ${e.message} `,
				submitter_orcid,
			);

			this.logger.error(`Error: ${e.message}`);
		} finally {
			if (!reportStream) {
				return;
			}
			const { errors, success_count, total_report_count, resource_ids } =
				await this.process_report_stream(reportStream);
			await this.eventEmitter.emitAsync(
				BulkSubmissionEvent.name,
				new BulkSubmissionEvent(submitter_orcid, resource_ids),
			);

			const notification_body = this.build_notification_body(
				errors,
				success_count,
				total_report_count,
			);

			await this.notificationsService.create_user_notification(
				'Submission report',
				notification_body,
				submitter_orcid,
			);

			if (success_count > 0) {
				this.logger.log(`Success count ${success_count}`);
				await this.eventEmitter.emitAsync(
					BulkSubmissionEvent.name,
					new BulkSubmissionEvent(submitter_orcid, resource_ids),
				);
			}
		}
	}

	private async process_report_stream(
		reportsStream,
	): Promise<SubmissionProcessingReport> {
		let error_report = [];
		let successful_reports_count = 0;
		let total_report_count = 0;

		const affected_resource_ids = new Set<string>();
		return new Promise((resolve, reject) => {
			reportsStream.on('data', async ({ errors, report }: ValidatedReport) => {
				total_report_count++;
				if (errors.length == 0) {
					successful_reports_count += 1;
					try {
						const reportDocument = new this.reportModel(report);

						await this.submitReports.insertReport(reportDocument, {
							preventEvents: true,
						});

						this.logger.log(
							`Sucessfully inserted Report for ${report.resource_id} by ${report.curator_orcid}`,
						);
					} catch (e) {
						if (e) {
							this.logger.error(e?.message);
							error_report.push({
								target: report,
								property: 'all',
								constraints: {
									InsertionError: e?.message,
								},
							});
						} else {
							this.logger.error(`Error Inserting the report \n ${report}`);
							error_report.push({
								target: report,
								property: 'all',
								constraints: {
									InsertionError: 'Error Inserting the report',
								},
							});
						}
					} finally {
						affected_resource_ids.add(report.resource_id);
					}
				} else {
					error_report = error_report.concat(errors);
				}
			});

			reportsStream.on('end', async () => {
				resolve({
					errors: error_report,
					success_count: successful_reports_count,
					total_report_count,
					resource_ids: Array.from(affected_resource_ids),
				});
			});

			reportsStream.on('error', (error) => {
				this.logger.error(error);
				reject(error);
			});
		});
	}

	private build_notification_body(
		error_reports: ValidationError[],
		success_count: number,
		total_count: number,
	) {
		function error_report_to_text(report: any) {
			const constraints = Object.entries(report.constraints)
				.map(([name, err]) => {
					return `- ${name}: ${err}`;
				})
				.join('\n');

			const text = `
            For Report:\n${JSON.stringify(
							report.target,
							null,
							0,
						)}\nErrors:\n${constraints}`;
			return text;
		}

		let submission_report = [];
		if (success_count > 0) {
			submission_report = [
				`Successfully submitted ${success_count}/${total_count}:`,
			];
		} else {
			submission_report = [`Submission failed!`];
			if (total_count > 0) {
				submission_report.push(
					`Could not find any report in the submitted file`,
				);
			}
		}

		if (error_reports.length > 0) {
			submission_report.push(`Failed to submit ${error_reports.length}: `);
			submission_report.push(...error_reports.map(error_report_to_text));
		}
		return submission_report.join('\n');
	}

	private parse_default_report(file: string): Promise<any> {
		// create read stream from file
		const objectStream = new StreamObject();
		// const verifierStream = createReadStream(file).pipe(verifier())

		return new Promise((resolve, reject) => {
			try {
				// extract parser stream
				const parserStream = parser();

				const defaultsStream = parserStream
					.pipe(filter({ filter: /^(?!reports).*$/ }))
					.pipe(objectStream);
				const defaultReport = {};

				defaultsStream.on('data', ({ key, value }) => {
					defaultReport[key] = value;
				});

				parserStream.on('error', (error) => {
					reject(error);
				});

				defaultsStream.on('end', () => {
					resolve(defaultReport);
				});
				createReadStream(file).pipe(parserStream);
			} catch (e) {
				reject(e);
			}
		});
	}

	private build_report_stream(file, defaultReport, user: UserDocument): Stream {
		const pipeline = createReadStream(file).pipe(parser());

		const reportsPipeline = pipeline.pipe(pick({ filter: 'reports' }));

		const reportsStream = reportsPipeline.pipe(
			chain([
				new StreamArray(), // convert stream to array
				({ key, value }) => value, // extract the value
				(report) => {
					return { ...defaultReport, ...report };
				}, // merge the defaultReport and the report
				this.convert_object_to_report, // convert instances to SubmitReportDto,
				this.validate_report, // validate report and extract errors
				this.user_can_report(user), // validate if user has permission to submit report
			]),
		);
		return reportsStream;
	}

	private async validate_report(
		report: SubmitReportDto,
	): Promise<ValidatedReport> {
		const result = {
			report,
			errors: [] as ValidationError[],
		};
		try {
			const validation_errors: ValidationError[] = await validate(report);
			if (validation_errors.length > 0) {
				this.logger.error(`Errors found in Report validation\n`, report);
				this.logger.error('Validation Errors: ', validation_errors);
			}
			result.errors = validation_errors;
		} catch (e: any) {
			if (e) {
				this.logger.error('Error Validating report: \n', report);
				if (e instanceof Error) {
					this.logger.error(e.message, e.stack, e.name);
				}
			}

			result.errors = [
				{
					target: report,
					property: 'all',
					constraints: {
						ProcessingError: 'The report document is not processable',
					},
				},
			];
		} finally {
			return result;
		}
	}

	private user_can_report(
		user: UserDocument,
	): ({ report, errors }: ValidatedReport) => ValidatedReport {
		return ({ report, errors }: ValidatedReport) => {
			const error = this.check_submission_priviledge(user, report);
			if (error) {
				errors.push(error);
			}
			return {
				report,
				errors,
			};
		};
	}

	private check_submission_priviledge(
		user: UserDocument,
		report: SubmitReportDto,
	): ValidationError | null {
		const allowedResources = user.resources.map(
			({ resource_id }) => resource_id,
		);
		if (allowedResources.includes(report.resource_id)) {
			return null;
		}
		return {
			target: report,
			property: 'resource_id',
			value: report.resource_id,
			constraints: {
				UserSubmitPermission: `The user does not have permission to submit to the resource ${report.resource_id}`,
			},
			children: [],
		};
	}

	private convert_object_to_report(obj: SubmitReportDto) {
		return plainToClass(SubmitReportDto, obj);
		// const report = new SubmitReportDto();
		// report.activity_term = obj.activity_term;
		// report.curator_orcid = obj.curator_orcid;
		// report.entity_uri = obj.entity_uri;
		// report.timestamp = new Date(obj.timestamp);
		// report.resource_id = obj.resource_id;

		// return report;
	}
}
