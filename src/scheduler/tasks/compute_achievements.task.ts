import { ComputeBadgesTask } from './compute_badges.task';
import { ComputeMedalsTask } from './compute_medals.task';
import { Command, Option } from 'nest-commander';
import { Task } from '../interfaces/task.abstract';
import { TaskArguments } from '../constants';
interface ComputeAchievementsTaskArgs {
	resource_id: string;
	orcid_id?: string;
}
@Command({
	name: 'compute_achievements',
	description: 'Compute achievements for a resource',
})
export class ComputeAchievementsTask extends Task {
	constructor(
		protected computeBadgesTask: ComputeBadgesTask,
		protected computeMedalsTask: ComputeMedalsTask,
	) {
		super();
	}

	public async run(extraParams: string[], task_arg: Pick<TaskArguments, 'resource_id' | 'orcid_id'>) {
		const { orcid_id } = task_arg;
		this.logger.log(`Running ComputeAchievementsTask with ${JSON.stringify(task_arg, null, 2)}`);
		if (orcid_id) {
			await this.computeBadgesTask.run(extraParams, task_arg);
		} else {
			const badgesPromise = this.computeBadgesTask.run(extraParams, task_arg);
			const medalsPromise = this.computeMedalsTask.run(extraParams, task_arg);
			await Promise.all([badgesPromise, medalsPromise]);
		}
	}
	@Option({
		name: 'resource_id',
		flags: '-r, --resource_id <resource_id>',
		description: 'Resource ID for which to compute achivements',
		required: true,
	})
	parseResource(val: string) {
		return val;
	}

	@Option({
		name: 'orcid_id',
		flags: '-o, --orcid_id <orcid_id>',
		description: 'Orcid ID for which to compute achivements (optional)',
		required: false,
	})
	parseOrcid(val: string) {
		return val;
	}
}
