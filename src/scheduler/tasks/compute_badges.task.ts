import { Injectable, Logger } from '@nestjs/common';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TaskArgument } from '../../scheduler-client/types/baseTask';
import { User, UserDocument } from '../../core/schemas/user.schema';
import { BadgeAggregatorService } from '../../badges/services/badge-aggregator.service';
import { UsersService } from '../../auth/users/services/users.service';

@Injectable()
export class ComputeBadgesTask {
	constructor(
		protected partnerResourceService: PartnerResourcesService,
		protected usersService: UsersService,
		protected badgeAggregator: BadgeAggregatorService,
	) {}

	logger = new Logger(ComputeBadgesTask.name);

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
			this.logger.log(
				`Computing Badges for user ${orcid_id} for resource ${resource_id}`,
			);

			const user = await this.usersService.getByOrcid(orcid_id);
			if (user) {
				await this.badgeAggregator.applyAllReports(resource_id);
			} else {
				this.logger.error(`User ${orcid_id} Not found !!`);
			}
		} else {
			this.logger.log(`Computing Badges for resource ${resource_id}`);

			await this.badgeAggregator.applyAllReports(resource_id);
		}
	}
}
