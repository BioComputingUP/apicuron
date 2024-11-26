import { Test, TestingModule } from '@nestjs/testing';
import { CuratorRegistryAggregatorService } from './curator-registry-aggregator.service';

describe('CuratorRegistryAggregatorService', () => {
  let service: CuratorRegistryAggregatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CuratorRegistryAggregatorService],
    }).compile();

    service = module.get<CuratorRegistryAggregatorService>(CuratorRegistryAggregatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
