import { Module } from '@nestjs/common';
import { CoreApicuronModule } from '../core/core.module';
import { DetailedStatisticsController } from './controllers/detailed-statistics.controller';
import { DetailedStatisticsService } from './services/detailed-statistics.service';
import { AuthModule } from '../auth/auth.module';
import { DetailedStatisticsAggregatorService } from './services/detailed-statistics-aggregator.service';
import { ComputeDetailedStatisticsService } from './services/compute-detailed-stats.service';
import { DetailedStatisticsPipeline } from './aggregation/detailed-statistics-aggregation.service';
import { ResourcesModule } from '../resources/resources.module';
import { EventOrchestratorModule } from '../event-orchestrator/event-orchestrator.module';

@Module({
	imports: [
		CoreApicuronModule,
		AuthModule,
		ResourcesModule,
		EventOrchestratorModule.registerAsync({
			imports: [DetailedStatisticsModule],
			inject: [DetailedStatisticsAggregatorService],
			useFactory: (aggregator: DetailedStatisticsAggregatorService) => {
				return { aggregator };
			},
		}),
	],
	controllers: [DetailedStatisticsController],
	providers: [
		DetailedStatisticsService,
		ComputeDetailedStatisticsService,
		DetailedStatisticsPipeline,
		DetailedStatisticsAggregatorService,
	],
	exports: [DetailedStatisticsAggregatorService],
})
export class DetailedStatisticsModule {}
