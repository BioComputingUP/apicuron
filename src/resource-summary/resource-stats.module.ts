import { Module } from '@nestjs/common';
import { InitResourceStatsService } from './services/init-resource-stats.service';
import { ComputeResourceStatsService } from './services/compute-resource-stats.service';
import { ResourceStatsAggregator } from './services/resource-stats.aggregator';
import { CoreApicuronModule } from '../core/core.module';

@Module({
	imports: [CoreApicuronModule],
	controllers: [],
	providers: [
		InitResourceStatsService,
		ComputeResourceStatsService,
		ResourceStatsAggregator,
	],
	exports: [],
})
export class ResourceStatsModule {}
