import { HttpModule } from '@nestjs/axios';
import {
	ConfigurableModuleAsyncOptions,
	DynamicModule,
	FactoryProvider,
	Module,
	Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OrcidClientService } from './orcid-client.service';
import {
	ConfigurableModuleClass,
	generateApiUrlProvider,
	MODULE_OPTIONS_TOKEN,
} from './orcid-client-module-options';
import { OrcidClientModuleOptions } from './interfaces/orcid.interface';
import { OrcidTokenAuthService } from './token-auth.service';
import { OrcidAPIController } from '../orcid-search/orcid.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
	imports: [HttpModule, ConfigModule],
	providers: [OrcidClientService],
	exports: [OrcidClientService],
})
export class OrcidClientModule extends ConfigurableModuleClass {
	static register(options: OrcidClientModuleOptions) {
		const orcidAPIUrlProvider: FactoryProvider = generateApiUrlProvider();
		const dynamicModule = super.register(options);

		dynamicModule.providers.push(orcidAPIUrlProvider, OrcidTokenAuthService);
		dynamicModule.global = true;

		return dynamicModule;
	}

	static registerAsync(
		asyncOptions: ConfigurableModuleAsyncOptions<OrcidClientModuleOptions>,
	) {
		const orcidAPIUrlProvider: FactoryProvider = generateApiUrlProvider();
		const dynamicModule = super.registerAsync(asyncOptions);

		dynamicModule.providers.push(orcidAPIUrlProvider ,OrcidTokenAuthService);
		dynamicModule.global = true;
		return dynamicModule;
	}

}
