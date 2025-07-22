import { NotFoundException } from '@nestjs/common';
import { Command, Option } from 'nest-commander';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import { ComputeStatisticsService } from '../../statistics/compute-statistics/compute-statistics.service';
import { TaskArguments } from '../constants';
import { Task } from '../interfaces/task.abstract';

@Command({
	name: 'compute_stats',
	description: 'Compute statistics for a resource',
})
export class ComputeStatisticsTask extends Task {
	constructor(
		protected partnerResourceService: PartnerResourcesService,
		protected computeStatistics: ComputeStatisticsService,
	) {
		super();
	}

	public async run(
		extraArgs: string[],
		task_arg: Pick<TaskArguments, 'resource_id'> &
			Partial<Pick<TaskArguments, 'orcid_id'>>,
	) {
		const { resource_id, orcid_id } = task_arg;
		this.logger.log(
			`Running ComputeStatisticsTask with ${JSON.stringify(task_arg, null, 2)}`,
		);
		const resource = await this.partnerResourceService.get_resource(
			resource_id,
		);

		if (!resource) {
			this.logger.error(`Resource ${resource_id} not found ! Aborting`);
			throw new NotFoundException(`Resource ${resource_id} not found\n`);
		}
		try {
			if (orcid_id) {
				await this.computeStatistics.computeStatistics({
					resource_id: resource.resource_id,
					curator_orcid: orcid_id,
				});
			}
			await this.computeStatistics.computeStatistics({
				resource_id: resource.resource_id,
			});
		} catch (error) {
			this.logger.error(error);
			return;
		}
	}
	@Option({
		name: 'resource_id',
		flags: '-r, --resource_id <resource_id>',
		description: 'Resource ID for which to compute stats',
		required: true,
	})
	parseResource(val: string) {
		return val;
	}

	@Option({
		name: 'orcid_id',
		flags: '-o, --orcid_id <orcid_id>',
		description: 'Orcid ID for which to compute stats (optional)',
		required: false,
	})
	parseOrcid(val: string) {
		return val;
	}
}
