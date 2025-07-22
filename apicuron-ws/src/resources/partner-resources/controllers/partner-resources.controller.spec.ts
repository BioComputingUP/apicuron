import { Test, TestingModule } from '@nestjs/testing';
import { PartnerResourcesController } from './partner-resources.controller';

describe('PartnerResourcesController', () => {
	let controller: PartnerResourcesController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [PartnerResourcesController],
		}).compile();

		controller = module.get<PartnerResourcesController>(
			PartnerResourcesController,
		);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
