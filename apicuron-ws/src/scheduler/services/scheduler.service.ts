import { Injectable, Logger } from '@nestjs/common';


@Injectable()
export class SchedulerService {
	constructor() {
		// this.tasks = ['test_task', 'submit_bulk']
	}
	tasks = ['test_task', 'submit_bulk'];

	logger = new Logger(SchedulerService.name);

	async run_task(task: string, file: string | null, ...args) {
		// let tasks = ['test_task', 'submit_bulk']
		if (!this.tasks.includes(task)) {
			throw new Error(`Task ${task} does not exist`);
		}
		await this[task](file, ...args);
	}

	private test_task(file = null, resource_id: string, orcid_id = null) {
		console.log({
			resource_id,
			orcid_id,
			file,
		});
		return;
	}
}
