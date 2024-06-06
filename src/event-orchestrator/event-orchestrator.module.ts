import { Module } from '@nestjs/common';
import { ConfigurableModuleClass } from './event-orchestrator.module-definition';
import { CoreApicuronModule } from '../core/core.module';
import { ManyReportsSubmittedHandler } from './handlers/many-reports-submitted.handler';
import { ReportSubmittedEventHandler } from './handlers/report-submitted.handler';
import { ResourceReportsDeletedHandler } from './handlers/resource-reports-deleted.handler';
import { TermDeletedEventHandler } from './handlers/term-deleted.handler';
import { UserPrivacyUpdatedEventHandler } from './handlers/user-privacy-updated.handler';
import { TermUpdatedEventHandler } from './handlers/term-updated.handler';
import { InitializationService } from './services/initialization.service';
import { BulkReportSubmissionHandler } from './handlers/bulk-submission.handler';

@Module({
	imports: [CoreApicuronModule],
	providers: [
		InitializationService,
		ManyReportsSubmittedHandler,
		ReportSubmittedEventHandler,
		BulkReportSubmissionHandler,
		ResourceReportsDeletedHandler,
		UserPrivacyUpdatedEventHandler,
		TermUpdatedEventHandler,
		TermDeletedEventHandler,
	],
	exports: [],
})
export class EventOrchestratorModule extends ConfigurableModuleClass {}
