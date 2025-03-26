import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { OrcidAPIController } from './orcid.controller';
import { OrcidClientModule } from '../orcid-client/orcid-client.module';
import { CoreApicuronModule } from 'src/core/core.module';
import { OrcidSyncService } from './orcid-sync.service';

@Module({
	imports: [AuthModule, OrcidClientModule, CoreApicuronModule],
	controllers: [OrcidAPIController],
	providers: [OrcidSyncService]
})
export class OrcidSyncModule {}
