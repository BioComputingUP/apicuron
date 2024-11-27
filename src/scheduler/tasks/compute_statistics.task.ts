import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import { TaskArgument } from '../../scheduler-client/types/baseTask';
import { User, UserDocument } from '../../core/schemas/user.schema';
import { ComputeStatisticsService } from '../../statistics/compute-statistics/compute-statistics.service';

@Injectable()
export class ComputeStatisticsTask {
	constructor(
		protected partnerResourceService: PartnerResourcesService,
		protected computeStatistics: ComputeStatisticsService,
	) {}

	logger = new Logger(ComputeStatisticsTask.name);

	public async run_task(task_arg: TaskArgument) {
		if (task_arg.logLevel) {
			this.logger.localInstance.setLogLevels(task_arg.logLevel);
		}
		const [resource_id, orcid_id] = task_arg.arguments;

		const resource = await this.partnerResourceService.get_resource(
			resource_id,
		);

		if (!resource) {
			this.logger.error(`Resource ${resource_id} not found ! Aborting`);
			return;
		}
		if (orcid_id) {
			await this.computeStatistics.computeStatistics({
				resource_id: resource.resource_id,
				curator_orcid: orcid_id,
			});
		}
		await this.computeStatistics.computeStatistics({
			resource_id: resource.resource_id,
		});
	}
}
