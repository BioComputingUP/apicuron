import { Injectable } from '@nestjs/common';
import { Aggregator } from '../../event-orchestrator/interfaces/aggregator.interface';
import { Document, FilterQuery, Model, Types } from 'mongoose';
import {
	Report,
	LeanReportDocument,
	ReportDocument,
} from '../../core/schemas/reports.schema';
import { InjectModel } from '@nestjs/mongoose';
import {
	WeeklyStatistics,
	WeeklyStatisticsDocument,
} from '../../core/schemas/statistics/weekly-statistics.schema';
import { ComputeWeeklyStatisticsService } from './compute-weekly-statistics.service';
import { PrivacyType } from '../../core/enums';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import { computeAggregatePrivacyField } from '../../util/privacy.helper';

@Injectable()
export class WeeklyStatisticsAggregatorService implements Aggregator {
	constructor(
		@InjectModel(WeeklyStatistics.name)
		protected weeklyStatModel: Model<WeeklyStatisticsDocument>,
		protected resourceService: PartnerResourcesService,
		protected computeWeeklyStat: ComputeWeeklyStatisticsService,
	) {}
	async updateUserPrivacy(curator_orcid: string, privacy: PrivacyType) {
		await this.weeklyStatModel.updateMany(
			{
				privacy: PrivacyType.public,
				curator_orcid,
			},
			{
				$set: { privacy },
			},
		);

		const resource_ids = await this.weeklyStatModel.distinct('resource_id', {
			curator_orcid,
		});

		const resources = await this.resourceService.get_resources({
			resource_id: { $in: resource_ids },
		});

		const updates$ = [];

		for (const resource of resources) {
			for (const league of resource.leagues) {
				const update$ = this.weeklyStatModel.updateMany(
					{
						curator_orcid,
						resource_id: resource.resource_id,
						league: league.name,
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
				updates$.push(update$);
			}
		}

		await Promise.all(updates$);
	}

	async applyReport(
		report:
			| (Document<unknown, any, Report> & Report & { _id: Types.ObjectId })
			| LeanReportDocument,
	) {
		return await this.computeWeeklyStat.updateWithReport(report);
	}
	async applyAllReports(resource_id: string) {
		const reportFilter: FilterQuery<ReportDocument> = { resource_id };

		await this.computeWeeklyStat.computeWeeklyStatistics(reportFilter);
	}
	async removeAllResourceAggregates(resource_id: string) {
		await this.weeklyStatModel.deleteMany({ resource_id });
	}
}
