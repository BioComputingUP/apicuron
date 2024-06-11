import { Injectable, Logger } from '@nestjs/common';
import { Aggregator } from '../../event-orchestrator/interfaces/aggregator.interface';
import { Document, Model, Types } from 'mongoose';
import { Report, LeanReportDocument } from '../../core/schemas/reports.schema';
import { ComputeStatisticsService } from '../compute-statistics/compute-statistics.service';
import { InjectModel } from '@nestjs/mongoose';
import {
	Statistics,
	StatisticsDocument,
} from '../../core/schemas/statistics.schema';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import { computeAggregatePrivacyField } from '../../util/privacy.helper';
import { PrivacyType } from '../../core/enums';

@Injectable()
export class StatisticsAggregator implements Aggregator {
	constructor(
		@InjectModel(Statistics.name)
		protected statModel: Model<StatisticsDocument>,
		protected resourceService: PartnerResourcesService,
		protected computeStats: ComputeStatisticsService,
	) {}
	logger = new Logger(StatisticsAggregator.name);

	async updateUserPrivacy(curator_orcid: string, privacy: PrivacyType) {
		this.logger.log(
			`Handling Update user stat privacy event in statistics service ${curator_orcid} ${privacy} `,
		);

		await this.statModel.updateMany(
			{
				curator_orcid,
				privacy: PrivacyType.public,
			},
			{
				$set: { privacy },
			},
		);

		const resourceIds = await this.statModel.distinct('resource_id', {
			curator_orcid,
		});

		// Retrieve the resources associated with the resource IDs
		const resources = await this.resourceService.get_resources({
			resource_id: { $in: resourceIds },
		});

		// Get the leagues associated with the resources
		const resourceLeagues = resources
			.map((resource) => this.resourceService.getResourceLeagues(resource))
			.flat();

		const updatePromises$ = [];
		for await (const [resource, league] of resourceLeagues) {
			const updatePromise$ = this.statModel.updateMany(
				{
					resource_id: resource.resource_id,
					league: league.name,
					curator_orcid: curator_orcid,
				},
				{
					$set: {
						privacy: computeAggregatePrivacyField(
							{ privacy: league.visibility },
							{ privacy },
						),
					},
				},
			);
			updatePromises$.push(updatePromise$);
		}

		await Promise.all(updatePromises$);
		return;
	}

	async applyReport(
		report:
			| (Document<unknown, any, Report> & Report & { _id: Types.ObjectId })
			| LeanReportDocument,
	) {
		return await this.computeStats.incrementStatByReport(report);
	}
	async applyAllReports(resource_id: string) {
		await this.computeStats.computeStatistics({ resource_id });
	}
	async removeAllResourceAggregates(resource_id: string) {
		const result = await this.statModel.deleteMany({
			resource_id,
		});
		this.logger.debug(
			`Deleted ${result.deletedCount} statistics for ${resource_id}`,
		);
	}
}
