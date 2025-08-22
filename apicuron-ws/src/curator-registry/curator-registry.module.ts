import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { CoreApicuronModule } from 'src/core/core.module';
import { ResourcesModule } from 'src/resources/resources.module';
import { CuratorRegistryController } from './curator-registry.controller';
import { CuratorRegistryService } from './curator-registry.service';
import { CuratorRegistryAggregatorService } from './services/curator-registry-aggregator.service';
import { RegistryQueryService } from './services/registry-query.service';
import { PrivacyFilterStrategy } from './strategies/privacy.strategy';
@Module({
	imports: [CoreApicuronModule, AuthModule, ResourcesModule],
	providers: [
		CuratorRegistryAggregatorService,
		CuratorRegistryService,
		RegistryQueryService,
		PrivacyFilterStrategy,
	],
	controllers: [CuratorRegistryController],
})
export class CuratorRegistryModule {}
