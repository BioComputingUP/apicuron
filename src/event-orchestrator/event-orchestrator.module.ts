import { Module } from '@nestjs/common';
import { CoreApicuronModule } from '../core/core.module';
import { ManyReportsSubmittedHandler } from './handlers/many-reports-submitted.handler';
import { ReportSubmittedEventHandler } from './handlers/report-submitted.handler';
import { ResourceReportsDeletedHandler } from './handlers/resource-reports-deleted.handler';
import { TermDeletedEventHandler } from './handlers/term-deleted.handler';
import { UserPrivacyUpdatedEventHandler } from './handlers/user-privacy-updated.handler';
import { TermUpdatedEventHandler } from './handlers/term-updated.handler';
import { InitializationService } from './services/initialization.service';
import { BulkReportSubmissionHandler } from './handlers/bulk-submission.handler';
import { DeleteLeagueHandler } from './handlers/delete-league.handler';
import { AggregatorManager } from './services/aggregator-manager.service';
import { DiscoveryModule } from '@nestjs/core';
import { AggregatorLoader } from './services/aggregator-loader.service';
import { BaseAggregatorRunner } from './aggregator-runners/base.runner';
import { SubmissionRunner } from './aggregator-runners/bulk-submission.runner';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Module({
	imports: [DiscoveryModule, CoreApicuronModule, EventEmitter2],
	providers: [
		InitializationService,
		ManyReportsSubmittedHandler,
		ReportSubmittedEventHandler,
		BulkReportSubmissionHandler,
		ResourceReportsDeletedHandler,
		UserPrivacyUpdatedEventHandler,
		TermUpdatedEventHandler,
		TermDeletedEventHandler,
		DeleteLeagueHandler,
		AggregatorLoader,
		AggregatorManager,
		BaseAggregatorRunner,
		SubmissionRunner,
	],
	exports: [],
})
export class EventOrchestratorModule {}
