import { Injectable, Logger } from '@nestjs/common';
import { PartnerResourcesService } from '../../resources/partner-resources/partner-resources.service';
import { InjectModel } from '@nestjs/mongoose';
import { AchievementDef } from '../../core/schemas/achievement-def.schema';
import { TaskArgument } from '../../scheduler-client/types/baseTask';
import { ComputeMedalsService } from '../../achievements/services/compute-medals.service';

@Injectable()
export class ComputeMedalsTask {
	constructor(
		protected partnerResourceService: PartnerResourcesService,
		@InjectModel(AchievementDef.name)
		protected computeMedals: ComputeMedalsService,
	) {}

	logger = new Logger(ComputeMedalsTask.name);

	public async run_task(task_arg: TaskArgument) {
		if (task_arg.logLevel) {
			this.logger.localInstance.setLogLevels(task_arg.logLevel);
		}
		const [resource_id] = task_arg.arguments;
		const resource = await this.partnerResourceService.get_resource(
			resource_id,
		);

		if (!resource) {
			this.logger.error(`Resource ${resource_id} not found ! Aborting`);
			return;
		}
		this.logger.log(`Computing medals for resource ${resource_id}`);
		// we first compute the medals for the resource`)
		await this.computeMedals.computeResourceMedals(resource);
	}
}
