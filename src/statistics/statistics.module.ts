import { Module } from '@nestjs/common';
import {
	OldStatisticsController,
	StatisticsController,
} from './statistics/statistics.controller';
import { StatisticsService } from './statistics.service';
import { AuthModule } from '../auth/auth.module';
import { ResourcesModule } from '../resources/resources.module';
import { CoreApicuronModule } from '../core/core.module';
import { ComputeStatisticsService } from './compute-statistics/compute-statistics.service';
import { CacheModule } from '@nestjs/cache-manager';
import { StatisticsEventHandlerService } from './events/event-handler.service';
import { BadgesModule } from '../badges/badges.module';
import { MedalsModule } from '../medals/medals.module';
import { EventOrchestratorModule } from '../event-orchestrator/event-orchestrator.module';
import { StatisticsAggregator } from './services/statistics-aggregator.service';
import { EventOrchestratorModuleOptions } from '../event-orchestrator/interfaces/event-orchestrator-options.interface';
import { StatisticsReportAggregator } from './aggregation/aggregate-reports.service';

@Module({
	imports: [
		CoreApicuronModule,
		AuthModule,
		ResourcesModule,
		BadgesModule,
		MedalsModule,
		CacheModule.register({
			max: 100,
			shouldCloneBeforeSet: false,
		}),
		EventOrchestratorModule.registerAsync({
			imports: [StatisticsModule],
			inject: [StatisticsAggregator],
			useFactory(
				statisticsAggregator: StatisticsAggregator,
			): EventOrchestratorModuleOptions {
				return {
					aggregator: statisticsAggregator,
				};
			},
		}),
	],
	controllers: [StatisticsController, OldStatisticsController],
	providers: [
		StatisticsReportAggregator,
		StatisticsService,
		ComputeStatisticsService,
		StatisticsAggregator,
		StatisticsEventHandlerService,
	],
	exports: [ComputeStatisticsService, StatisticsAggregator],
})
export class StatisticsModule {}
