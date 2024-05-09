import { Injectable, Logger } from '@nestjs/common';
import { Report, ReportDocument } from '../../../core/schemas/reports.schema';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Runner } from '../interfaces/runner';
import {
	Statistics,
	StatisticsDocument,
} from '../../../core/schemas/statistics.schema';
import { PartnerResourcesService } from '../../../resources/partner-resources/partner-resources.service';
import { computePrivacyField } from '../../../util/privacy.helper';
import { AggregatedReportIteratorService } from '../../data-iteration/iterators/aggregated-report-iterator.service';
import { BaseReportAggregationService } from '../../data-aggregation/aggregators/base-report-aggregation.service';
import { BaseReportIteratorResult } from '../../data-iteration/interfaces/base-report-iterator-result';
import { EarnedMedalsService } from '../../../achievements/services/earned-medals.service';
import { EarnedBadgesService } from '../../../achievements/services/earned-badges.service';

@Injectable()
export class ComputeStatisticsRunnerService implements Runner {
	logger: Logger = new Logger(ComputeStatisticsRunnerService.name);
	constructor(
		protected aggregator: BaseReportAggregationService,
		protected iterator: AggregatedReportIteratorService,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
		@InjectModel(Statistics.name) protected statModel: Model<Statistics>,
		protected resourceService: PartnerResourcesService,
		protected earnedMedalsService: EarnedMedalsService,
		protected earnedBadgesService: EarnedBadgesService,
	) {}

	private async initStat({ report, resource, user }: BaseReportIteratorResult) {
		const stat = new this.statModel({
			resource_id: report.resource_id,
			curator_orcid: report.curator_orcid,
			league:
				report.league ??
				this.resourceService.getUserLeague(resource, user.orcid_id),
		});
		const achievementFilter = {
			resource_id: stat.resource_id,
			curator_orcid: stat.curator_orcid,
			league: stat.league,
		};
		stat.badges_count = await this.earnedBadgesService.getEarnedBadgesCount(
			achievementFilter,
		);
		stat.badges_count = await this.earnedMedalsService.getEarnedMedalsCount(
			achievementFilter,
		);
		stat.first_contribution = report.first_contribution;
		stat.last_contribution = report.last_contribution;
		return stat;
	}

	/**
	 * Runs the pipeline to aggregate and iterate over reports, compute statistics, and save them.
	 * @returns {Promise<void>} A promise that resolves when the pipeline has finished running.
	 */
	async runPipeline(filter: FilterQuery<ReportDocument> = {}) {
		const aggregation = this.aggregator.aggregate(this.reportModel, [
			{ $match: filter },
		]);
		const iterator = this.iterator.iterate(aggregation);

		let stat: StatisticsDocument | null = null;
		const statSaves$ = [];
		for await (const aggregatedReport of iterator) {
			const { report, resource, term, user } = aggregatedReport;

			if (!stat) {
				stat = await this.initStat(aggregatedReport);
			}

			if (
				stat.resource_id != report.resource_id ||
				stat.curator_orcid != report.curator_orcid ||
				stat.league != report.league
			) {
				statSaves$.push(stat.save());
				stat = await this.initStat(aggregatedReport);
			}
			computePrivacyField(resource, user, stat);
			const score = term.score;
			const activity_category = term.activity_category;

			stat[`${activity_category}_count`] += report.count;
			stat[`${activity_category}_score`] += report.count * score;
			stat.total_count += report.count;
			stat.total_score += report.count * score;

			stat.last_contribution =
				stat.last_contribution > report.last_contribution
					? stat.last_contribution
					: report.last_contribution;

			stat.first_contribution =
				stat.first_contribution > report.first_contribution
					? report.first_contribution
					: stat.first_contribution;
		}

		if (stat) {
			statSaves$.push(stat.save());
		}

		await Promise.all(statSaves$);

		this.logger.log(
			`Pipeline ran successfully, Computed ${statSaves$.length} stats`,
		);
	}
}
