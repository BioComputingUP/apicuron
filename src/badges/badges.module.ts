import { Module } from '@nestjs/common';
import { EventOrchestratorModule } from '../event-orchestrator/event-orchestrator.module';
import { BadgeAggregatorService } from './services/badge-aggregator.service';
import { CoreApicuronModule } from '../core/core.module';
import { DataAggregationModule } from '../aggregation/data-aggregation/data-aggregation.module';
import { BadgeDefCommandsService } from './services/badge-def-commands.service';
import { BadgeDefDeletedEventHandler } from './handlers/badge-def-deleted.handler';
import { BadgeDefUpdatedEventHandler } from './handlers/badge-def-updated.handler';
import { BadgesDefController } from './controllers/badge-def.controller';
import { AuthModule } from '../auth/auth.module';
import { ResourcesModule } from '../resources/resources.module';
import { BadgeDefQueriesService } from './services/badge-def-queries.service';
import { BadgeDefCreatedEventHandler } from './handlers/badge-def-created.handler';
import { ComputeBadgesService } from './services/compute-badges.service';
import { EarnedBadgesService } from './services/earned-badges.service';

@Module({
	imports: [
		CoreApicuronModule,
		AuthModule,
		ResourcesModule,
		DataAggregationModule,
		EventOrchestratorModule.registerAsync({
			imports: [BadgesModule],
			inject: [BadgeAggregatorService],
			useFactory(badgeAggregator: BadgeAggregatorService) {
				return {
					aggregator: badgeAggregator,
				};
			},
		}),

		// ReportAggregatorModule.register(BadgeAggregatorService),
	],
	providers: [
		BadgeDefCommandsService,
		BadgeDefQueriesService,
		ComputeBadgesService,
		BadgeDefCreatedEventHandler,
		BadgeDefUpdatedEventHandler,
		BadgeDefDeletedEventHandler,
		EarnedBadgesService,
		BadgeAggregatorService,
	],
	exports: [BadgeAggregatorService, EarnedBadgesService],
	controllers: [BadgesDefController],
})
export class BadgesModule {}
