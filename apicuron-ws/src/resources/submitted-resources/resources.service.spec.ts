import { Test, TestingModule } from '@nestjs/testing';
import { SubmittedResourcesService } from './resources.service';

describe('ResourcesService', () => {
  let service: SubmittedResourcesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubmittedResourcesService],
    }).compile();

    service = module.get<SubmittedResourcesService>(SubmittedResourcesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
