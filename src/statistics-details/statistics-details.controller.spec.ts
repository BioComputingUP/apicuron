import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsDetailsController } from './statistics-details.controller';

describe('StatisticsDetailsController', () => {
  let controller: StatisticsDetailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatisticsDetailsController],
    }).compile();

    controller = module.get<StatisticsDetailsController>(StatisticsDetailsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
