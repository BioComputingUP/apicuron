import { ConfigurableModuleBuilder, FactoryProvider } from '@nestjs/common';
import { OrcidClientModuleOptions } from './interfaces/orcid.interface';
import { OrcidApiUrl } from './constants';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
	new ConfigurableModuleBuilder<OrcidClientModuleOptions>().build();

export function generateApiUrlProvider(): FactoryProvider {
	return {
		provide: OrcidApiUrl,
		inject: [MODULE_OPTIONS_TOKEN],
		useFactory(clientOptions: OrcidClientModuleOptions) {
			return clientOptions.apiUrl;
		},
	};
}
