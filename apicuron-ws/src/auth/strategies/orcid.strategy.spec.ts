import { Test, TestingModule } from '@nestjs/testing';
import { OrcidStrategy } from './orcid.strategy';

describe('OrcidStrategy', () => {
  let provider: OrcidStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrcidStrategy],
    }).compile();

    provider = module.get<OrcidStrategy>(OrcidStrategy);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
