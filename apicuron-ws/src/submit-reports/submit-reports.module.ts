import { Module } from '@nestjs/common';
import { CoreApicuronModule } from '../core/core.module';
import { SubmitReportsController } from './controllers/submit-report.controller';
import { AuthModule } from '../auth/auth.module';
import { ResourcesModule } from '../resources/resources.module';
import { SubmitReportService } from './services/submit-reports.service';
import { EntityUriValid } from './validators/entity-uri';
import { LeagueValidator } from './validators/league-validator';
import { ReportValidatorService } from './services/report-validator.service';
import { SubmitBulkTask } from 'src/scheduler/tasks/submit_bulk.task';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
	imports: [
		CoreApicuronModule,
		AuthModule,
		ResourcesModule,
		NotificationsModule
	],
	providers: [
		SubmitReportService,
		EntityUriValid,
		ReportValidatorService,
		LeagueValidator,
		SubmitBulkTask
	],
	controllers: [SubmitReportsController],
	exports: [SubmitReportService],
})
export class SubmitReportModule {}
