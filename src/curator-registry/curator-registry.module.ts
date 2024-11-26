import { Module } from '@nestjs/common';
import { CuratorRegistryAggregatorService } from './services/curator-registry-aggregator/curator-registry-aggregator.service';

@Module({
  providers: [CuratorRegistryAggregatorService]
})
export class CuratorRegistryModule {}
