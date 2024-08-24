import { Module } from '@nestjs/common';
import { SubmitOrcidWork } from './submit-orcid.service';
import { ConfigService } from '@nestjs/config';
import { DefaultWorkBuilder } from './work-builders/default.work-builder';
import { OrcidWorkBuilderToken } from './constants';
import { OrcidClientModule } from '../../orcid/orcid-client/orcid-client.module';
import { CoreApicuronModule } from '../../core/core.module';
import { OrcidClientModuleOptions } from '../orcid-client/interfaces/orcid.interface';

@Module({
	imports: [
		CoreApicuronModule,
		OrcidClientModule.registerAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService): OrcidClientModuleOptions => {
				return {
					apiUrl: config.get<string>('ORCID_API_URL'),
					client_id: config.get<string>('ORCID_CLIENT_ID'),
					client_secret: config.get<string>('ORCID_CLIENT_SECRET'),
					scopes: ['/read-limited', '/activities/update'],
					loadOnStartup: config.get<string>('environment') != 'local',
				};
			},
		}),
	],
	controllers: [],
	providers: [
		{
			inject: [ConfigService],
			provide: OrcidWorkBuilderToken,
			useFactory(config: ConfigService) {
				return new DefaultWorkBuilder(config);
			},
		},
		SubmitOrcidWork,
	],
})
export class OrcidSubmissionModule {}
