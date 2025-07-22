import { Test, TestingModule } from '@nestjs/testing';
import { ComputeStatisticsService } from './compute-statistics.service';
describe('StatisticsService', () => {
	let service: ComputeStatisticsService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [ComputeStatisticsService],
		}).compile();

		service = module.get<ComputeStatisticsService>(ComputeStatisticsService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
