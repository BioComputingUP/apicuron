import { Module } from '@nestjs/common';
import { CoreApicuronModule } from '../core/core.module';
import { AggregatedReportIteratorService } from './aggregated-report-iterator.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
	imports: [
		CoreApicuronModule,
		CacheModule.register({
			max: 100,
			shouldCloneBeforeSet: false,
		}),
	],
	providers: [AggregatedReportIteratorService],
	exports: [AggregatedReportIteratorService],
})
export class AggregatedReportIteratorModule {}
