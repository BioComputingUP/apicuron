import { Module } from '@nestjs/common';
import { EventOrchestratorModule } from '../event-orchestrator/event-orchestrator.module';
import { BadgeAggregatorService } from './services/badge-aggregator.service';
import { CoreApicuronModule } from '../core/core.module';
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
import { GroupReportsByUserAggregator } from './aggregation/group-reports-by-user.service';
import { BadgesController } from './controllers/badges.controller';
import { BadgesQueryService } from './services/badges-query.service';

@Module({
	imports: [
		CoreApicuronModule,
		AuthModule,
		ResourcesModule,
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
		GroupReportsByUserAggregator,
		BadgeDefCommandsService,
		BadgeDefQueriesService,
		ComputeBadgesService,
		BadgeDefCreatedEventHandler,
		BadgeDefUpdatedEventHandler,
		BadgeDefDeletedEventHandler,
		EarnedBadgesService,
		BadgeAggregatorService,
		BadgesQueryService,
	],
	exports: [BadgeAggregatorService, EarnedBadgesService],
	controllers: [BadgesDefController, BadgesController],
})
export class BadgesModule {}
