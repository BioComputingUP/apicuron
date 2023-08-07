import { Injectable, Logger, Inject } from '@nestjs/common';
import { TaskArgument } from '../../scheduler-client/types/baseTask';
import { ComputeBadgesTask } from './compute_badges.task';
import { ComputeMedalsTask } from './compute_medals.task';

@Injectable()
export class ComputeAllMetricsTask {
	constructor(
		@Inject('task:compute_achievements') protected computeAchievementsTask,
		@Inject('task:compute_statistics') protected computeStatisticsTask,
	) {}

	public async run_task(task_arg: TaskArgument) {
		const [resource_id, orcid_id] = task_arg.arguments;

		await this.computeAchievementsTask.run_task(task_arg);
		await this.computeStatisticsTask.run_task(task_arg);
	}
}
