import { Test, TestingModule } from '@nestjs/testing';
import { AchievementsDefService } from './achievements-def.service';

describe('AchievementsService', () => {
  let service: AchievementsDefService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AchievementsDefService],
    }).compile();

    service = module.get<AchievementsDefService>(AchievementsDefService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
