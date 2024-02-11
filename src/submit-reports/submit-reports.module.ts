import { Module } from '@nestjs/common';
import { CoreApicuronModule } from '../core/core.module';
import { SubmitReportsController } from './controllers/submit-report.controller';
import { AuthModule } from '../auth/auth.module';
import { ResourcesModule } from '../resources/resources.module';
import { SubmitReportService } from './services/submit-reports.service';
import { SchedulerClientModule } from '../scheduler-client/scheduler-client.module';
import { EntityUriValid } from './validators/entity-uri';
import { ReportMetaHandler } from './services/report-meta.handler';

@Module({
	imports: [
		CoreApicuronModule,
		AuthModule,
		ResourcesModule,
		SchedulerClientModule,
	],
	providers: [SubmitReportService, EntityUriValid, ReportMetaHandler],
	controllers: [SubmitReportsController],
	exports: [SubmitReportService],
})
export class SubmitReportModule {}
