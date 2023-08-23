import { Injectable, Logger, Inject } from '@nestjs/common';
import { PartnerResourcesService } from '../../resources/partner-resources/partner-resources.service';
import { PartnerResource } from '../../core/schemas/resource.schema';

@Injectable()
export class ComputeAllMetricsTask {
	constructor(
		@Inject('task:compute_achievements') protected computeAchievementsTask,
		@Inject('task:compute_statistics') protected computeStatisticsTask,
		protected resources: PartnerResourcesService,
	) {}

	public async run_task() {

		const resources = await this.resources.get_resources()

		const statPromises = resources.map(async ({ resource_id }: PartnerResource) => {
			await this.computeAchievementsTask.run_task([resource_id]);
			return this.computeStatisticsTask.run_task([resource_id]);
		})

		await Promise.all(statPromises);
	}
}
