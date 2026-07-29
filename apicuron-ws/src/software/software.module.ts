import { Module } from '@nestjs/common';
import { SoftwareController } from './software.controller';
import { CoreApicuronModule } from 'src/core/core.module';
import { GithubOrcidResolver } from './helpers/github-orcid.resolver';
import { PrContributionProcessor } from './processors/pr_closed.processor';
import { SubmitReportModule } from 'src/submit-reports/submit-reports.module';

@Module({
	imports: [CoreApicuronModule, SubmitReportModule],
	controllers: [SoftwareController],
	providers: [GithubOrcidResolver, PrContributionProcessor],
})
export class SoftwareModule {}
