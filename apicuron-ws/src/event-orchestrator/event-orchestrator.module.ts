import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CoreApicuronModule } from '../core/core.module';
import { SubmissionRunner } from './aggregator-runners/bulk-submission.runner';
import { BulkReportSubmissionHandler } from './handlers/bulk-submission.handler';
import { DeleteLeagueHandler } from './handlers/delete-league.handler';
import { LeagueUpdatedHandler } from './handlers/league-updated.handler';
import { ManyReportsSubmittedHandler } from './handlers/many-reports-submitted.handler';
import { ReportSubmittedEventHandler } from './handlers/report-submitted.handler';
import { ResourceReportsDeletedHandler } from './handlers/resource-reports-deleted.handler';
import { ResourceUpdatedEventHandler } from './handlers/resource-updated.handler';
import { TermDeletedEventHandler } from './handlers/term-deleted.handler';
import { TermUpdatedEventHandler } from './handlers/term-updated.handler';
import { UserUpdatedEventHandler } from './handlers/user-updated.handler';
import { AggregatorLoader } from './services/aggregator-loader.service';
import { AggregatorManager } from './services/aggregator-manager.service';
import { InitializationService } from './services/initialization.service';

@Module({
	imports: [DiscoveryModule, CoreApicuronModule, EventEmitterModule],
	providers: [
		InitializationService,
		ManyReportsSubmittedHandler,
		LeagueUpdatedHandler,
		ReportSubmittedEventHandler,
		BulkReportSubmissionHandler,
		ResourceReportsDeletedHandler,
		UserUpdatedEventHandler,
		TermUpdatedEventHandler,
		TermDeletedEventHandler,
		DeleteLeagueHandler,
		AggregatorLoader,
		AggregatorManager,
		SubmissionRunner,
		ResourceUpdatedEventHandler,
	],
	exports: [],
})
export class EventOrchestratorModule {}
