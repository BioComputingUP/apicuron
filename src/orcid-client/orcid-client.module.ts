import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrcidClientService } from './orcid-client.service';
import { OrcidApiUrl } from './constants';

@Module({
	imports: [HttpModule, ConfigModule],
	providers: [
		OrcidClientService,
		{
			provide: OrcidApiUrl,
			inject: [ConfigService],
			useFactory(config: ConfigService) {
				const orcidApiUrl = config.get<string>('ORCID_API_URL');
				if (!orcidApiUrl) {
					throw new Error('ORCID_API_URL is not defined in the environment');
				}
				return orcidApiUrl;
			},
		},
	],
})
export class OrcidClientModule {}
