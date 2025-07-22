import { Injectable } from '@nestjs/common';
import { BulkSubmissionEvent } from '../../submit-reports/events/events';
import { OnEvent } from '@nestjs/event-emitter';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import { ComputeResourceStatsService } from '../services/compute-resource-stats.service';

@Injectable()
export class BulkSubmissionHandler {
	constructor(
		protected resourceService: PartnerResourcesService,
		protected computeResourceStats: ComputeResourceStatsService,
	) {}

	/**
	 * Handles the bulk submission of reports
	 * @param reports
	 */
	@OnEvent(BulkSubmissionEvent.name, { async: true, promisify: true })
	async handleBulkSubmission(payload: BulkSubmissionEvent) {
		for (const resource_id of payload.resource_ids) {
			const resource = await this.resourceService.get_resource(resource_id);
			resource.stats.lastResourceUpdateDate = new Date();

			const [
				contribution_count,
				uniqueContributors,
				lastContributionDate,
				firstContributionDate,
			] = await Promise.all([
				this.computeResourceStats.getContributionCount(resource_id),
				this.computeResourceStats.getUniqueContributorsCount(resource_id),
				this.computeResourceStats.getFirstOrLastSubmissionDate(
					resource_id,
					'last',
				),
				this.computeResourceStats.getFirstOrLastSubmissionDate(
					resource_id,
					'first',
				),
			]);
			resource.stats.contributionCount = contribution_count;
			resource.stats.uniqueContributors = uniqueContributors;
			resource.stats.lastContributionDate = lastContributionDate;
			resource.stats.firstContributionDate = firstContributionDate;

			await resource.save();
		}
	}
}
