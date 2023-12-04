import { Injectable, Logger, Inject } from '@nestjs/common';
import { PartnerResourcesService } from '../../resources/partner-resources/partner-resources.service';
import { PartnerResource } from '../../core/schemas/resource.schema';
import { ComputeAchievementsTask } from './compute_achievements.task';
import { ComputeStatisticsTask } from './compute_statistics.task';

@Injectable()
export class ComputeAllMetricsTask {
	constructor(
		@Inject('task:compute_achievements')
		protected computeAchievementsTask: ComputeAchievementsTask,
		@Inject('task:compute_statistics')
		protected computeStatisticsTask: ComputeStatisticsTask,
		protected resources: PartnerResourcesService,
	) {}

	public async run_task() {
		const resources = await this.resources.get_resources();

		const statPromises = resources.map(
			async ({ resource_id }: PartnerResource) => {
				await this.computeAchievementsTask.run_task({
					arguments: [resource_id],
				});
				return await this.computeStatisticsTask.run_task({
					arguments: [resource_id],
				});
			},
		);

		await Promise.all(statPromises);
	}
}
