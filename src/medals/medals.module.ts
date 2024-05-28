import { Module } from '@nestjs/common';
import { EventOrchestratorModule } from '../event-orchestrator/event-orchestrator.module';
import { MedalAggregatorService } from './services/medal-aggregator.service';
import { CoreApicuronModule } from '../core/core.module';
import { DataAggregationModule } from '../aggregation/data-aggregation/data-aggregation.module';
import { MedalDefCommandsService } from './services/medal-def-commands.service';
import { MedalDefDeletedEventHandler } from './handlers/medal-def-deleted.handler';
import { MedalDefUpdatedEventHandler } from './handlers/medal-def-updated.handler';
import { MedalsDefController } from './controllers/medal-def.controller';
import { AuthModule } from '../auth/auth.module';
import { ResourcesModule } from '../resources/resources.module';
import { MedalDefQueriesService } from './services/medal-def-queries.service';
import { MedalDefCreatedEventHandler } from './handlers/medal-def-created.handler';
import { ComputeMedalsService } from './services/compute-medals.service';
import { EarnedMedalsService } from './services/earned-medals.service';

@Module({
	imports: [
		CoreApicuronModule,
		AuthModule,
		ResourcesModule,
		DataAggregationModule,
		EventOrchestratorModule.registerAsync({
			imports: [MedalsModule],
			inject: [MedalAggregatorService],
			useFactory(medalAggregator: MedalAggregatorService) {
				return {
					aggregator: medalAggregator,
				};
			},
		}),

		// ReportAggregatorModule.register(BadgeAggregatorService),
	],
	providers: [
		MedalDefCommandsService,
		MedalDefQueriesService,
		ComputeMedalsService,
		MedalDefCreatedEventHandler,
		MedalDefUpdatedEventHandler,
		MedalDefDeletedEventHandler,
		EarnedMedalsService,
		MedalAggregatorService,
	],
	exports: [MedalAggregatorService, EarnedMedalsService],
	controllers: [MedalsDefController],
})
export class MedalsModule {}
