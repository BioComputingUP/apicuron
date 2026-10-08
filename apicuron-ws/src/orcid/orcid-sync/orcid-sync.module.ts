import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { OrcidAPIController } from './orcid.controller';
import { OrcidClientModule } from '../orcid-client/orcid-client.module';
import { CoreApicuronModule } from 'src/core/core.module';
import { OrcidSyncService } from './orcid-sync.service';
import { GithubIdentityModule } from 'src/github-identity/github-identity.module';

@Module({
	imports: [AuthModule, OrcidClientModule, CoreApicuronModule, GithubIdentityModule],
	controllers: [OrcidAPIController],
	providers: [OrcidSyncService]
})
export class OrcidSyncModule {}
