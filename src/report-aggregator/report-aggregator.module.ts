import { Module } from '@nestjs/common';
import { ConfigurableModuleClass } from './report-aggregator.module-definition';
import { CoreApicuronModule } from '../core/core.module';
import { ManyReportsSubmittedHandler } from './handlers/many-reports-submitted.handler';
import { ReportSubmittedEventHandler } from './handlers/report-submitted.handler';
import { ResourceReportsDeletedHandler } from './handlers/resource-reports-deleted.handler';
import { TermDeletedEventHandler } from './handlers/term-deleted.handler';

@Module({
	imports: [CoreApicuronModule],
	providers: [
		ManyReportsSubmittedHandler,
		ReportSubmittedEventHandler,
		ResourceReportsDeletedHandler,
		TermDeletedEventHandler,
	],
	exports: [],
})
export class ReportAggregatorModule extends ConfigurableModuleClass {}
