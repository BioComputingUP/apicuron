import { Module } from '@nestjs/common';
import { SoftwareController } from './software.controller';
import { CoreApicuronModule } from 'src/core/core.module';
import { GithubOrcidResolver } from './helpers/github-orcid.resolver';

@Module({
	imports: [CoreApicuronModule],
	controllers: [SoftwareController],
	providers: [GithubOrcidResolver],
})
export class SoftwareModule {}
