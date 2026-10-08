import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { CoreApicuronModule } from 'src/core/core.module';
import { PendingReportsModule } from 'src/pending_reports/pending_reports.module';
import { SubmitReportModule } from 'src/submit-reports/submit-reports.module';
import { TrackerEventsController } from './contribution-events.controller';
import { GithubIdentityRepository } from './identity/github-identity.repository';
import { ContributionEventsRepository } from './repository/contribution-events.repository';
import { ResourceSourceRepository } from './repository/resource-source.repository';
import { ContributionEventProcessor } from './services/contribution-event-processor.service';
import { TrackerEventsIngestService } from './services/tracker-events-ingest.service';

@Module({
	imports: [CoreApicuronModule, JwtModule, AuthModule, SubmitReportModule, PendingReportsModule],
	providers: [
		ContributionEventsRepository,
		TrackerEventsIngestService,
		ResourceSourceRepository,
		GithubIdentityRepository,
		ContributionEventProcessor,
	],
	exports: [ContributionEventsRepository],
	controllers: [TrackerEventsController],
})
export class ContributionEventsModule {}
