import { Injectable, Logger } from '@nestjs/common';
import { IncomingMessage, request } from 'http';
import * as FormData from 'form-data';
import { TaskSubmit } from '../types/baseTask';
import { ConfigService } from '@nestjs/config';
import { createReadStream, fstatSync } from 'fs';
import { HttpModule, HttpService } from '@nestjs/axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { config } from 'process';
import { PartnerResourcesService } from '../../resources/partner-resources/partner-resources.service';
import { AxiosResponse } from 'axios';
// const FormData = require('form-data')
@Injectable()
export class SchedulerClientService {
	constructor(
		protected config: ConfigService,
		protected http: HttpService,
		protected partnerResourceService: PartnerResourcesService,
	) {}

	private url = this.config.get('SCHEDULER');

	private schedulerLogger = new Logger(SchedulerClientService.name);

	private task_name = this.config.get('SCHEDULER_TASK');
	private database_host = this.config.get('db_host');
	private database = this.config.get('database');

	async submit_task(task: TaskSubmit): Promise<AxiosResponse> {
		const form = this.base_form();

		// TODO: this condition was set to fit the features of the dev.scheduler on local. Now it is rendered useless because dev.scheduler.it isn't running
		if (this.config.get('environment') == 'dev_scheduler') {
			form.append('task_name', task.task_name);

			// parent job only available to the dev version of scheduler
			if (task.parent_job) {
				form.append('parent_job', task.parent_job);
			}
		} else {
			form.append('task', task.task_name);
			form.append('task_name', this.task_name);
		}

		if (task.task_arguments) {
			form.append('task_arguments', task.task_arguments);
		}
		if (task.file) {
			form.append('task_file_argument', createReadStream(task.file.path), {
				filename: task.file.originalname,
				contentType: task.file.mimetype,
				knownLength: task.file.size,
			});
		}

		try {
			this.http.axiosRef.post;
			const response = await this.http.axiosRef.postForm(this.url, form, {
				headers: {
					'Content-Type': `multipart/form-data; boundary=${form.getBoundary()}`,
					'Content-Length': form.getLengthSync(),
				},
			});

			this.schedulerLogger.log(
				`Task ${task.task_name} with the arguments ${task.task_arguments} Submitted`,
			);
			this.schedulerLogger.log(
				`Response Status: ${response.statusText}/${response.status}`,
			);
			this.schedulerLogger.log(`Response: ${response.data}`);

			return response;
		} catch (e) {
			this.schedulerLogger.error(`Failed to submit Job ${task.task_name} !`);
			this.schedulerLogger.error(e?.message);
			this.schedulerLogger.error(e?.response?.data);
			throw new Error(e);
		}
	}

	private base_form(): FormData {
		const form = new FormData();

		form.append('task', this.task_name);
		form.append('database_host', this.database_host);
		form.append('database', this.database);

		return form;
	}

	async test_task() {
		const response = await this.submit_task({
			task_name: 'test_task',
			task_arguments: 'hello world',
		}).catch((reason) => {
			this.schedulerLogger.error(reason);
		});
		return response;
	}

	/**
	 *
	 * @param {Object} reports (Multer.File object describing the file containing the curation data )
	 * @param {String} orcid_id (The submitter of the data)
	 * @param {String[]} delete_all (list of resources to delete wipe the )
	 * @description This function takes three params
	 * @returns
	 */

	async submit_reports(
		reports: Express.Multer.File,
		orcid_id: string,
		delete_all: string[] = [],
	) {
		const response = await this.submit_task({
			task_name: 'submit_report',
			task_arguments: `${orcid_id} ${delete_all.join(',')}`,
			file: reports,
		}).catch((err) => {
			this.schedulerLogger.error(err);
		});

		return response;
	}

	/**
	 *
	 * @param resource_id resource id of the resource to compute the statistics
	 * @param orcid_id optional orcid_id if this triggers a re-compute of the orcid_id
	 */
	async compute_statistics(
		resource_id: string,
		orcid_id = '',
		parent_job = null,
	) {
		const task = {
			task_name: 'compute_statistics',
			task_arguments: `${resource_id} ${orcid_id}`,
		};
		if (parent_job) {
			task['parent_job'] = parent_job;
		}
		const response = await this.submit_task(task).catch((err) => {
			this.schedulerLogger.error(err);
		});

		return response;
	}

	/**
	 *
	 * @param resource_id resource id of the resource to compute the statistics
	 * @param orcid_id optional orcid_id if this triggers a re-compute of the orcid_id
	 */
	async compute_achievements(
		resource_id: string,
		orcid_id = '',
		parent_job = null,
	) {
		const task = {
			task_name: 'compute_achievements',
			task_arguments: `${resource_id} ${orcid_id}`,
		};
		if (parent_job) {
			task['parent_job'] = parent_job;
		}
		const response = await this.submit_task(task);

		return response;
	}

	// @Cron(CronExpression.EVERY_5_HOURS)
	async add_resource_id() {
		if (this.config.get('environment') != 'local') {
			const response = await this.submit_task({
				task_name: 'add_resource_id',
			}).catch((err) => {
				this.schedulerLogger.error(err);
			});

			return response;
		}
	}

	async disprot_update() {
		const curation_database =
			this.config.get('environment') != 'production'
				? 'apicuron_update_dev'
				: 'apicuron_update';
		const response = await this.submit_task({
			task_name: 'disprot_update',
			task_arguments: curation_database,
		});
		return response;
	}

	async compute_all_metrics() {
		return await this.submit_task({
			task_name: 'compute_all_metrics',
		});
	}

	@Cron(CronExpression.EVERY_DAY_AT_2AM)
	private async daily_periodic_compute() {
		const currentEnv = this.config.get('environment');
		if (currentEnv == 'production') {
			await this.compute_all_metrics();
			return;
		}
		if (currentEnv == 'development') {
			// then we compute the achievements of all resources
			const resources = await this.partnerResourceService.get_resources();

			for (const resource of resources) {
				const { data } = await this.compute_achievements(resource.resource_id);
				if (data.uuid && currentEnv == 'development') {
					const jobId = data.uuid;
					this.compute_statistics(resource.resource_id, undefined, jobId);
				} else {
					await this.compute_statistics(resource.resource_id);
				}
			}

			return;
		}
	}
}
