import { Test, TestingModule } from '@nestjs/testing';
import { AchievementsDefController } from './achievements-def.controller';

describe('AchievementsDefController', () => {
  let controller: AchievementsDefController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AchievementsDefController],
    }).compile();

    controller = module.get<AchievementsDefController>(AchievementsDefController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
