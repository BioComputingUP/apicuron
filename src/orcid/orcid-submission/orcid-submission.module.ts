import { Module, Provider } from '@nestjs/common';
import { SubmitOrcidWork } from './submit-orcid.service';
import { ConfigService } from '@nestjs/config';
import { DefaultWorkBuilder } from './work-builders/default.work-builder';
import { OrcidWorkBuilderToken, RunCronJobs } from './constants';
import { OrcidClientModule } from '../../orcid/orcid-client/orcid-client.module';
import { CoreApicuronModule } from '../../core/core.module';
import { OrcidClientModuleOptions } from '../orcid-client/interfaces/orcid.interface';

const providers: Provider[] = [
	{
		inject: [ConfigService],
		provide: OrcidWorkBuilderToken,
		useFactory(config: ConfigService) {
			return new DefaultWorkBuilder(config);
		},
	},
	{
		inject: [ConfigService],
		provide: RunCronJobs, // This provider is used to determine if cronjobs should run or not
		useFactory(config: ConfigService): boolean {
			return config.get<string>('environment') != 'local';
		},
	},
	SubmitOrcidWork,
];
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
	providers,
})
export class OrcidSubmissionModule {}
