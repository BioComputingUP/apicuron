import { Logger, NotFoundException } from '@nestjs/common';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import { MedalAggregatorService } from '../../medals/services/medal-aggregator.service';
import { Command, Option } from 'nest-commander';
import { Task } from '../interfaces/task.abstract';
import { TaskArguments } from '../constants';


@Command({
	name: 'compute_medals',
	description: 'Computes medals for a resource',
})
export class ComputeMedalsTask extends Task {
	constructor(
		protected partnerResourceService: PartnerResourcesService,
		protected medalsAggregator: MedalAggregatorService,
	) {
		super();
	}
	public async run(extraArgs: string[], task_arg: Pick<TaskArguments, 'resource_id'>) {
		const resource_id = task_arg.resource_id;
		const resource = await this.partnerResourceService.get_resource(
			resource_id,
		);

		if (!resource) {
			this.logger.error(`Resource ${resource_id} not found ! Aborting`);
			throw new NotFoundException(`Resource ${resource_id} not found\n`);
		}
		this.logger.log(`Computing medals for resource ${resource_id}`);
		await this.medalsAggregator.applyAllReports(resource_id);
		this.logger.log(`Done Computing medals for resource ${resource_id}`);
	}
	@Option({
		name: 'resource_id',
		flags: '-r, --resource_id <resource_id>',
		description: 'Resource ID for which to compute badges',
		required: true,
	})
	parseResource(val: string) {
		return val;
	}
}
