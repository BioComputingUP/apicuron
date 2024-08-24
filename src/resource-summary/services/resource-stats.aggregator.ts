import { Injectable } from '@nestjs/common';
import { Aggregator } from '../../event-orchestrator/interfaces/aggregator.interface';
import {
	LeanReportDocument,
	ReportDocument,
} from '../../core/schemas/reports.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../core/schemas/resource/partner-resource.schema';
import { getLastDayDate, getLastWeekDate } from '../../util/date.helper';
import { ComputeResourceStatsService } from './compute-resource-stats.service';

@Injectable()
export class ResourceStatsAggregator implements Aggregator {
	constructor(
		@InjectModel(PartnerResource.name)
		protected resourceModel: Model<PartnerResourceDocument>,
		protected computeStats: ComputeResourceStatsService,
	) {}
	async applyReport(report: LeanReportDocument | ReportDocument) {
		const resource = await this.resourceModel.findOne({
			resource_id: report.resource_id,
		});
		if (report.timestamp > getLastDayDate()) {
			resource.stats.lastDayContributionCount += 1;
			resource.stats.lastWeekContributionCount += 1;
		} else if (report.timestamp > getLastWeekDate()) {
			resource.stats.lastWeekContributionCount += 1;
		}

		resource.stats.contribution_count += 1;

		resource.stats.uniqueContributors =
			await this.computeStats.getUniqueContributorsCount(report.resource_id);
		resource.stats.lastSubmissionDate =
			await this.computeStats.getFirstOrLastSubmissionDate(
				report.resource_id,
				-1,
			);
		if (!resource.stats.firstSubmissionDate) {
			resource.stats.firstSubmissionDate =
				await this.computeStats.getFirstOrLastSubmissionDate(
					report.resource_id,
					1,
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

	async recomputeAllResourceAggregates(resource_id: string) {
		await this.computeStats.computeResourceStats(resource_id);
	}
}
