import { Module } from '@nestjs/common';
import { CuratorRegistryAggregatorService } from './services/curator-registry-aggregator.service';
import { AuthModule } from 'src/auth/auth.module';
import { CoreApicuronModule } from 'src/core/core.module';
import { CuratorRegistryService } from './curator-registry.service';
import { CuratorRegistryController } from './curator-registry.controller';
import { ResourcesModule } from 'src/resources/resources.module';
@Module({
	imports: [CoreApicuronModule, AuthModule, ResourcesModule],
	providers: [CuratorRegistryAggregatorService, CuratorRegistryService],
	controllers: [CuratorRegistryController],
})
export class CuratorRegistryModule {}
