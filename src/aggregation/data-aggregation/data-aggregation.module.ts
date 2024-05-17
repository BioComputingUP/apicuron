import { Module, Type } from '@nestjs/common';
import { CoreApicuronModule } from '../../core/core.module';
import { BaseReportAggregationService } from './aggregators/base-report-aggregation.service';
import { DetailedReportAggregationService } from './aggregators/detailed-report-aggregation.service';
import { GroupReportsByUserAggregationService } from './aggregators/group-reports-by-user.service';
import { Aggregator } from './interfaces/aggregator.interface';

const Aggregators: Type<Aggregator<any>>[] = [
	DetailedReportAggregationService,
	BaseReportAggregationService,
	GroupReportsByUserAggregationService,
];
@Module({
	imports: [CoreApicuronModule],
	providers: Aggregators,
	exports: Aggregators,
})
export class DataAggregationModule {}
