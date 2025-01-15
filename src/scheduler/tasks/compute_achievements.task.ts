import { Injectable, Inject } from '@nestjs/common';
import { TaskArgument } from '../../scheduler-client/types/baseTask';
import { ComputeBadgesTask } from './compute_badges.task';
import { ComputeMedalsTask } from './compute_medals.task';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ComputeAchievementsTask {
	constructor(
		@Inject('task:compute_badges')
		protected computeBadgesTask: ComputeBadgesTask,
		@Inject('task:compute_medals')
		protected computeMedalsTask: ComputeMedalsTask,
		private eventEmitter: EventEmitter2,
	) {}

	public async run_task(task_arg: TaskArgument) {
		// const [resource_id, orcid_id] = task_arg.arguments;

		// if (orcid_id) {
		// 	await this.computeBadgesTask.run_task(task_arg);
		// } else {
		// 	const badgesPromise = this.computeBadgesTask.run_task(task_arg);
		// 	const medalsPromise = this.computeMedalsTask.run_task(task_arg);
		// 	await Promise.all([badgesPromise, medalsPromise]);
		// }
	}
}
