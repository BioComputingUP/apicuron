import { Module } from '@nestjs/common';
import { CoreApicuronModule } from '../../core/core.module';
import { BaseReportAggregationService } from './aggregators/base-report-aggregation.service';
import { DetailedReportAggregationService } from './aggregators/detailed-report-aggregation.service';

@Module({
	imports: [CoreApicuronModule],
	providers: [DetailedReportAggregationService, BaseReportAggregationService],
	exports: [BaseReportAggregationService, DetailedReportAggregationService],
})
export class DataAggregationModule {}
