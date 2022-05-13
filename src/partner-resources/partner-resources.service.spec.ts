import { Test, TestingModule } from '@nestjs/testing';
import { PartnerResourcesService } from './partner-resources.service';

describe('PartnerResourcesService', () => {
  let service: PartnerResourcesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PartnerResourcesService],
    }).compile();

    service = module.get<PartnerResourcesService>(PartnerResourcesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
