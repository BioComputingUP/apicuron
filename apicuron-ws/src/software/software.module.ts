import { Module } from '@nestjs/common';
import { SoftwareController } from './software.controller';
import { CoreApicuronModule } from 'src/core/core.module';
import { GithubOrcidResolver } from './helpers/github-orcid.resolver';
import { PrContributionProcessor } from './processors/pr_closed.processor';
import { SubmitReportModule } from 'src/submit-reports/submit-reports.module';
import { PendingReportsModule } from 'src/pending_reports/pending_reports.module';

@Module({
	imports: [CoreApicuronModule, SubmitReportModule, PendingReportsModule],
	controllers: [SoftwareController],
	providers: [GithubOrcidResolver, PrContributionProcessor],
})
export class SoftwareModule {}
