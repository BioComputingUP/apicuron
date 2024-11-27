import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { OrcidAPIController } from './orcid.controller';
import { OrcidClientModule } from '../orcid-client/orcid-client.module';

@Module({
	imports: [AuthModule, OrcidClientModule],
	controllers: [OrcidAPIController],
})
export class OrcidSearchModule {}
