import { Module } from '@nestjs/common';
import { CoreApicuronModule } from '../core/core.module';
import { SubmitReportsController } from './controllers/submit-report.controller';
import { AuthModule } from '../auth/auth.module';
import { ResourcesModule } from '../resources/resources.module';
import { SubmitReportService } from './services/submit-reports.service';
import { SchedulerClientModule } from '../scheduler-client/scheduler-client.module';
import { EntityUriValid } from './validators/entity-uri';

@Module({
	imports: [
		CoreApicuronModule,
		AuthModule,
		ResourcesModule,
		SchedulerClientModule,
	],
	providers: [SubmitReportService, EntityUriValid],
	controllers: [SubmitReportsController],
})
export class SubmitReportModule {}
