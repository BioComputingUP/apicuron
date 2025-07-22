import { NotFoundException } from '@nestjs/common';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import { BadgeAggregatorService } from '../../badges/services/badge-aggregator.service';
import { UsersService } from '../../auth/users/services/users.service';
import { Command, Option } from 'nest-commander';
import { Task } from '../interfaces/task.abstract';
import { TaskArguments } from '../constants';


@Command({
	name: 'compute_badges',
	description:
		'Computes badges for an entire resource or a single user when specifying optional orcid_id option',
})
export class ComputeBadgesTask extends Task {
	constructor(
		protected partnerResourceService: PartnerResourcesService,
		protected usersService: UsersService,
		protected badgeAggregator: BadgeAggregatorService,
	) {
		super();
	}

	public async run(
		extraArgs: string[],
		taskArgs: Pick<TaskArguments, 'resource_id' | 'orcid_id'>
	): Promise<void> {
		this.logger.log(`Running Compute Badges Task with args: ${JSON.stringify(taskArgs, null, 2)}`);
		const resource_id = taskArgs.resource_id;
		const orcid_id = taskArgs.orcid_id;
		const resource = await this.partnerResourceService.get_resource(
			resource_id,
		);
		if (!resource) {
			this.logger.error(`Resource ${resource_id} not found ! Aborting`);
			throw new NotFoundException(`Resource ${resource_id} not found\n`);
		}
		if (!!orcid_id) {
			this.logger.debug(
				`Computing Badges for user ${orcid_id} for resource ${resource_id}`,
			);

			const user = await this.usersService.getByOrcid(orcid_id);
			if (user) {
				await this.badgeAggregator.applyAllReports(resource_id);
				this.logger.log(`Done Computing Badges for resource ${resource_id}`);
			} else {
				this.logger.error(`User ${orcid_id} Not found !!`);
				// throw new NotFoundException(`User ${orcid_id} Not found !!`);
			}
		} else {
			await this.badgeAggregator.applyAllReports(resource_id);
			this.logger.log(`Done Computing Badges for resource ${resource_id}`);
		}
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

	@Option({
		name: 'orcid_id',
		flags: '-o, --orcid_id [orcid_id]',
		description: 'ORCID ID for which to compute badges (in the specified resource)',
		required: false,
	})
	parseOrcid(val: string) {
		return val;
	}
}
