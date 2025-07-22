import { Injectable, Inject } from '@nestjs/common';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import { PartnerResource } from '../../core/schemas/resource/partner-resource.schema';
import { ComputeAchievementsTask } from './compute_achievements.task';
import { ComputeStatisticsTask } from './compute_statistics.task';
import { Command } from 'nest-commander';
import { Task } from '../interfaces/task.abstract';

@Command({
	name: 'compute_all',
	description: 'Compute all metrics for all resources',
})
export class ComputeAllMetricsTask extends Task {
	constructor(
		protected computeAchievementsTask: ComputeAchievementsTask,
		protected computeStatisticsTask: ComputeStatisticsTask,
		protected resources: PartnerResourcesService,
	) {
		super();
	}

	public async run(extraParams: string[]) {
		const resources = await this.resources.get_resources();

		const statPromises = resources.map(
			async ({ resource_id }: PartnerResource) => {
				await this.computeAchievementsTask.run(extraParams, { resource_id });
				return await this.computeStatisticsTask.run(extraParams, {
					resource_id,
				});
			},
		);

		await Promise.all(statPromises);
	}
}
