import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsDetailsService } from './statistics-details.service';

describe('StatisticsDetailsService', () => {
  let service: StatisticsDetailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatisticsDetailsService],
    }).compile();

    service = module.get<StatisticsDetailsService>(StatisticsDetailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
