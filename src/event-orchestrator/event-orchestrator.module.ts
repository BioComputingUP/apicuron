import { Module } from '@nestjs/common';
import { CoreApicuronModule } from '../core/core.module';
import { ManyReportsSubmittedHandler } from './handlers/many-reports-submitted.handler';
import { ReportSubmittedEventHandler } from './handlers/report-submitted.handler';
import { ResourceReportsDeletedHandler } from './handlers/resource-reports-deleted.handler';
import { TermDeletedEventHandler } from './handlers/term-deleted.handler';
import { UserUpdatedEventHandler } from './handlers/user-updated.handler';
import { TermUpdatedEventHandler } from './handlers/term-updated.handler';
import { InitializationService } from './services/initialization.service';
import { BulkReportSubmissionHandler } from './handlers/bulk-submission.handler';
import { DeleteLeagueHandler } from './handlers/delete-league.handler';
import { AggregatorManager } from './services/aggregator-manager.service';
import { DiscoveryModule } from '@nestjs/core';
import { AggregatorLoader } from './services/aggregator-loader.service';
import { SubmissionRunner } from './aggregator-runners/bulk-submission.runner';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LeagueUpdatedHandler } from './handlers/league-updated.handler';

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
	],
	exports: [],
})
export class EventOrchestratorModule {}
