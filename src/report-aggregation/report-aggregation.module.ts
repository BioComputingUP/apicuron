import { Module } from '@nestjs/common';
import { CoreApicuronModule } from '../core/core.module';
import { AggregateDateBoundsService } from './operations/aggregate-date-bounds.service';
import { BaseReportAggregationService } from './aggregators/base-report-aggregation.service';
import { AggregateDaysService } from './operations/aggregate-days.service';
import { AggregateMonthsService } from './operations/aggregate-months.service';
import { DetailedReportAggregationService } from './aggregators/detailed-report-aggregation.service';

@Module({
	imports: [CoreApicuronModule],
	providers: [
		AggregateDaysService,
		AggregateDateBoundsService,
		AggregateMonthsService,
		DetailedReportAggregationService,
		BaseReportAggregationService,
	],
	exports: [BaseReportAggregationService, DetailedReportAggregationService],
})
export class ReportAggregationModule {}
