import { Module } from '@nestjs/common';
import { CoreApicuronModule } from 'src/core/core.module';
import { PendingReportsRepository } from './repository/pending-report.repository';
import { PendingReportsService } from './services/pending-reports.service';

@Module({
	imports: [CoreApicuronModule],
	providers: [PendingReportsService, PendingReportsRepository],
	exports: [PendingReportsService],
})
export class PendingReportsModule {}
