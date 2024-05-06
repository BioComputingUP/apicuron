import { Injectable } from '@nestjs/common';
import { Aggregator } from '../../report-aggregation/interfaces/aggregator.interface';
import { BaseAggregationResult } from '../../report-aggregation/interfaces/aggregation-results';
import { Iterator } from '../../report-iterator/interfaces/iterator.interface';
import { BaseReportIteratorResult } from '../../report-iterator/interfaces/base-report-iterator-result';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class BaseRunnerService {
	constructor(
		protected aggregator: Aggregator<BaseAggregationResult>,
		protected iterator: Iterator<
			BaseAggregationResult,
			BaseReportIteratorResult
		>,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
	) {}
	async runPipeline() {
		const aggregation = this.aggregator.aggregate(this.reportModel);
		const iterator = this.iterator.iterate(aggregation);

		for await (const aggregatedReport of iterator) {
			console.log(aggregatedReport);
		}
	}
}
