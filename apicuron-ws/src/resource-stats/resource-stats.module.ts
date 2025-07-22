import { Module } from '@nestjs/common';
import { InitResourceStatsService } from './services/init-resource-stats.service';
import { ComputeResourceStatsService } from './services/compute-resource-stats.service';
import { ResourceStatsAggregatorService } from './services/resource-stats.aggregator';
import { CoreApicuronModule } from '../core/core.module';
import { BulkSubmissionHandler } from './handlers/bulk-submission.handler';
import { ResourcesModule } from '../resources/resources.module';

@Module({
	imports: [CoreApicuronModule, ResourcesModule],
	controllers: [],
	providers: [
		InitResourceStatsService,
		ComputeResourceStatsService,
		BulkSubmissionHandler,
		ResourceStatsAggregatorService,
	],
	exports: [],
})
export class ResourceStatsModule {}
