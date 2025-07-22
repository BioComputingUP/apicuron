import { Test, TestingModule } from '@nestjs/testing';
import { Reports } from './reports';

describe('Reports', () => {
  let provider: Reports;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Reports],
    }).compile();

    provider = module.get<Reports>(Reports);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
