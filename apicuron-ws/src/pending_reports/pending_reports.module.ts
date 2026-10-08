import { Module } from '@nestjs/common';
import { CoreApicuronModule } from 'src/core/core.module';
import { PendingReportsRepository } from './repository/pending-report.repository';
import { PendingReportsService } from './services/pending-reports.service';
import { ReconcilationService } from './services/reconciliation.service';
import { SubmitReportModule } from 'src/submit-reports/submit-reports.module';

@Module({
	imports: [CoreApicuronModule, SubmitReportModule],
	providers: [
		PendingReportsService,
		PendingReportsRepository,
		ReconcilationService,
	],
	exports: [PendingReportsService],
})
export class PendingReportsModule {}
