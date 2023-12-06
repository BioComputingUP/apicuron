import { Injectable, Logger, Inject } from '@nestjs/common';
import { SubmitReportDto } from '../../reports/dto/submit-report.dto';

import * as StreamObject from 'stream-json/streamers/StreamObject';
import { createReadStream } from 'fs';
import { filter } from 'stream-json/filters/Filter';
import { parser } from 'stream-json';
import { Stream, chain } from 'stream-chain';
import { pick } from 'stream-json/filters/Pick';
import * as StreamArray from 'stream-json/streamers/StreamArray';
import { validate, ValidationError } from 'class-validator';
import { User, UserDocument } from '../../core/schemas/user.schema';
import { NotificationsService } from '../../notifications/notifications.service';
import { TaskArgument } from '../../scheduler-client/types/baseTask';
import { ComputeAchievementsTask } from './compute_achievements.task';
import { ComputeStatisticsTask } from './compute_statistics.task';
import { InjectModel } from '@nestjs/mongoose';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { Model } from 'mongoose';
import { plainToClass } from 'class-transformer';

export type ValidatedReport = {
	report: SubmitReportDto;
	errors: ValidationError[];
};
export type ReportProcessReport = {
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
		@InjectModel(User.name) protected userModel: Model<UserDocument>,
		protected notificationsService: NotificationsService,
		@Inject('task:compute_achievements')
		protected compute_achievements: ComputeAchievementsTask,
		@Inject('task:compute_statistics')
		protected compute_statistics: ComputeStatisticsTask,
	) {}

	logger = new Logger(SubmitBulkTask.name);

	public async run_task(task_arg: TaskArgument) {
		// file: string, orcid_id: string, delete_all: string | null = null
		const file = task_arg.file;

		const [orcid_id, delete_all] = task_arg.arguments;

		if (delete_all) {
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
		return await this.main(file, orcid_id);
	}

	private async main(file: string, orcid_id: string) {
		let reportStream = null;
		try {
			const defaultReport = await this.parse_default_report(file);
			const user = await this.userModel.findOne({ orcid_id });
			if (!user) {
				throw new Error(`User with the ORCID ID ${orcid_id} does not exist`);
			}
			reportStream = this.build_report_stream(file, defaultReport, user);
		} catch (e) {
			await this.notificationsService.create_user_notification(
				'Submission Failed',
				`Error: ${e.message} `,
				orcid_id,
			);

			this.logger.error(`Error: ${e.message}`);
		} finally {
			if (reportStream) {
				const { errors, success_count, total_report_count, resource_ids } =
					await this.process_report_stream(reportStream);

				const notification_body = this.build_notification_body(
					errors,
					success_count,
					total_report_count,
				);

				await this.notificationsService.create_user_notification(
					'Submission report',
					notification_body,
					orcid_id,
				);

				for (const resource_id of resource_ids) {
					this.logger.log(`Computing Achievements for ${resource_id}`);
					await this.compute_achievements.run_task({
						arguments: [resource_id],
					});

					this.logger.log(`Computing Statistics for ${resource_id}`);
					await this.compute_statistics.run_task({
						arguments: [resource_id],
					});
				}
			}
		}
	}

	private async process_report_stream(
		reportsStream,
	): Promise<ReportProcessReport> {
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
						await this.reportModel.create(report);
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
		error_reports: Array<any>,
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
		}

		if (error_reports.length > 0) {
			submission_report.push(`Failed to submit ${error_reports.length}: `);
			submission_report.push(...error_reports.map(error_report_to_text));
		}
		return submission_report.join('\n');
	}

	private parse_default_report(file: string): Promise<Object> {
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

	private build_report_stream(file, defaultReport, user: User): Stream {
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
		try {
			const validation_errors: ValidationError[] = await validate(report);
			if (validation_errors.length > 0) {
				console.error(`Errors found in Report validation\n`, report);
				console.error('test error message');
				console.error('Validation Errors: ', validation_errors);
			}
			return {
				report,
				errors: validation_errors,
			};
		} catch (e: unknown) {
			if (e) {
				console.error('Error Validating report: \n', report);
			}
			return {
				report,
				errors: [
					{
						target: report,
						property: 'all',
						constraints: {
							ProcessingError: 'The report document is not processable',
						},
					},
				],
			};
		}
	}

	private user_can_report(user) {
		const user_resources = user.resources.map(({ resource_id }) => resource_id);
		return ({ report, errors }: ValidatedReport) => {
			if (user_resources.includes(report.resource_id)) {
				return { report, errors };
			} else {
				errors.push({
					target: report,
					property: 'resource_id',
					value: report.resource_id,
					constraints: {
						UserSubmitPermission: `The user ${user.orcid_id} does not have permission to submit to the resource ${report.resource_id}`,
					},
					children: [],
				});
				return { report, errors };
			}
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
