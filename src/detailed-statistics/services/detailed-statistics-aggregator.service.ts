import { Document, Model, Types } from 'mongoose';
import { PrivacyType } from '../../core/enums';
import { Report, LeanReportDocument } from '../../core/schemas/reports.schema';
import { Aggregator } from '../../event-orchestrator/interfaces/aggregator.interface';
import { InjectModel } from '@nestjs/mongoose';
import {
	DetailedStatistics,
	DetailedStatisticsDocument,
} from '../../core/schemas/statistics/detailed-statistics.schema';
import { ComputeDetailedStatisticsService } from './compute-detailed-stats.service';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import { computeAggregatePrivacyField } from '../../util/privacy.helper';

export class DetailedStatisticsAggregatorService implements Aggregator {
	constructor(
		@InjectModel(DetailedStatistics.name)
		protected detailedStatsModel: Model<DetailedStatisticsDocument>,
		protected computeDetailedStats: ComputeDetailedStatisticsService,
		protected resourceService: PartnerResourcesService,
	) {}
	async applyReport(
		report:
			| (Document<unknown, any, Report> & Report & { _id: Types.ObjectId })
			| LeanReportDocument,
	) {
		return await this.computeDetailedStats.upsertDetailedStats(report);
	}
	async applyAllReports(resource_id: string) {
		return await this.computeDetailedStats.computeDetailedStats({
			resource_id,
		});
	}
	async removeAllResourceAggregates(resource_id: string) {
		await this.detailedStatsModel.deleteMany({ resource_id });
	}
	async updateUserPrivacy(curator_orcid: string, privacy: PrivacyType) {
		await this.detailedStatsModel.updateMany(
			{
				curator_orcid,
				privacy: PrivacyType.public,
			},
			{
				privacy,
			},
		);

		const resource_ids = await this.detailedStatsModel.distinct('resource_id', {
			curator_orcid,
		});
		const resources = await this.resourceService.get_resources({
			resource_id: { $in: resource_ids },
		});
		const resourceLeagues = resources
			.map((resource) => this.resourceService.getResourceLeagues(resource))
			.flat();
		const updates$ = [];
		for (const [resource, league] of resourceLeagues) {
			const update$ = this.detailedStatsModel.updateMany(
				{
					resource_id: resource.resource_id,
					league: league.name,
					curator_orcid,
				},
				{
					privacy: computeAggregatePrivacyField(
						{ privacy: league.visibility },
						{ privacy },
					),
				},
			);

			updates$.push(update$);
		}

		await Promise.all(updates$);
	}
}
