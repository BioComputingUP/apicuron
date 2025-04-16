import { HttpModule } from '@nestjs/axios';
import {
	ConfigurableModuleAsyncOptions,
	DynamicModule,
	FactoryProvider,
	Module,
	Provider,
} from '@nestjs/common';
import { OrcidClientService } from './orcid-client.service';
import {
	generateApiUrlProvider,
	MODULE_OPTIONS_TOKEN,
} from './orcid-client-module-options';
import { OrcidClientModuleOptions } from './interfaces/orcid.interface';
import { OrcidTokenAuthService } from './token-auth.service';
import { OrcidApiUrl } from './constants';

@Module({})
class OrcidCoreClientModule {}

@Module({
	imports: [HttpModule],
	providers: [OrcidClientService],
	exports: [OrcidClientService],
})
export class OrcidClientModule {
	static forRootAsync(
		asyncOptions: ConfigurableModuleAsyncOptions<OrcidClientModuleOptions>,
	): DynamicModule {
		const orcidAPIUrlProvider: FactoryProvider = generateApiUrlProvider();

		const optionsProvider: Provider = {
			provide: MODULE_OPTIONS_TOKEN,
			...asyncOptions,
		} as Provider;

		return {
			global: true,
			module: OrcidCoreClientModule,
			imports: [HttpModule],
			providers: [optionsProvider, orcidAPIUrlProvider, OrcidTokenAuthService],
			exports: [MODULE_OPTIONS_TOKEN, OrcidApiUrl, OrcidTokenAuthService],
		};
	}
}
