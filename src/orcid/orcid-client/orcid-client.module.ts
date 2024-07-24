import { HttpModule } from '@nestjs/axios';
import {
	ConfigurableModuleAsyncOptions,
	FactoryProvider,
	Module,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OrcidClientService } from './orcid-client.service';
import {
	ConfigurableModuleClass,
	generateApiUrlProvider
} from './orcid-client-module-options';
import { OrcidClientModuleOptions } from './interfaces/orcid.interface';
import { OrcidTokenAuthService } from './token-auth.service';
import { OrcidAPIController } from './controllers/orcid.controller';
import { AuthModule } from '../../auth/auth.module';

@Module({
	imports: [HttpModule, ConfigModule, AuthModule],
	controllers: [OrcidAPIController],
	providers: [OrcidTokenAuthService, OrcidClientService],
	exports: [OrcidClientService],
})
export class OrcidClientModule extends ConfigurableModuleClass {
	static register(options: OrcidClientModuleOptions) {
		const orcidAPIUrlProvider: FactoryProvider = generateApiUrlProvider();
		const dynamicModule = super.register(options);

		dynamicModule.providers.push(orcidAPIUrlProvider);

		return dynamicModule;
	}

	static registerAsync(
		asyncOptions: ConfigurableModuleAsyncOptions<OrcidClientModuleOptions>,
	) {
		const orcidAPIUrlProvider: FactoryProvider = generateApiUrlProvider();
		const dynamicModule = super.registerAsync(asyncOptions);

		dynamicModule.providers.push(orcidAPIUrlProvider);
		return dynamicModule;
	}
}
