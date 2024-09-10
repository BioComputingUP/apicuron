import { Injectable } from '@nestjs/common';
import { Aggregator } from '../../event-orchestrator/interfaces/aggregator.interface';
import { ReportDocument } from '../../core/schemas/reports.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../core/schemas/resource/partner-resource.schema';
import { ComputeResourceStatsService } from './compute-resource-stats.service';
import { TermDocument } from '../../core/schemas/terms.schema';
import { AggregatorClass } from '../../event-orchestrator/decorators/aggregator.decorator';

@Injectable()
@AggregatorClass()
export class ResourceStatsAggregatorService implements Aggregator {
	constructor(
		@InjectModel(PartnerResource.name)
		protected resourceModel: Model<PartnerResourceDocument>,
		protected computeStats: ComputeResourceStatsService,
	) {}
	termUpdated() {
		return;
	}
	termDeleted() {
		return;
	}
	async applyReport(
		report: ReportDocument,
		term: TermDocument,
		resource: PartnerResourceDocument,
	) {
		resource.stats.lastResourceUpdateDate = new Date();
		resource.stats.contributionCount += 1;

		resource.stats.uniqueContributors =
			await this.computeStats.getUniqueContributorsCount(report.resource_id);
		resource.stats.lastContributionDate =
			await this.computeStats.getFirstOrLastSubmissionDate(
				report.resource_id,
				'last',
			);
		if (!resource.stats.firstContributionDate) {
			resource.stats.firstContributionDate =
				await this.computeStats.getFirstOrLastSubmissionDate(
					report.resource_id,
					'first',
				);
		}

		await resource.save();
	}
	async applyAllReports(resource_id: string) {
		await this.computeStats.computeResourceStats(resource_id);
	}
	async removeAllResourceAggregates(resource_id: string) {
		await this.computeStats.computeResourceStats(resource_id);
	}
	updateUserPrivacy() {
		return null;
	}

	async deleteLeague(resource_id: string): Promise<number> {
		await this.computeStats.computeResourceStats(resource_id);
		return 1;
	}

	// ignores this event because the stats are initialized at startup
	// and maintained using a dedicated event handler service
	// using this function would not match the name of the function in the aggregator
	// we do not recomputeAggregates when a bulk submission occurs in this case
	// we update the lastSubmissionDate and the contributionCount and set the lastSubmissionDate as the currentDate
	async recomputeAllResourceAggregates(resource_id: string) {
		return;
	}
}
