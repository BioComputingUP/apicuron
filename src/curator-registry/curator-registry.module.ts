import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { CoreApicuronModule } from 'src/core/core.module';
import { ResourcesModule } from 'src/resources/resources.module';
import { CuratorRegistryController } from './curator-registry.controller';
import { CuratorRegistryService } from './curator-registry.service';
import { CuratorRegistryAggregatorService } from './services/curator-registry-aggregator.service';
@Module({
	imports: [CoreApicuronModule, AuthModule, ResourcesModule],
	providers: [CuratorRegistryAggregatorService, CuratorRegistryService],
	controllers: [CuratorRegistryController],
})
export class CuratorRegistryModule {}
