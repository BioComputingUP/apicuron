/* eslint-disable @typescript-eslint/no-explicit-any */
import { BadRequestException } from '@nestjs/common';
import { PartnerResourcesService } from './partner-resources.service';

describe('PartnerResourcesService', () => {
	describe('update_allowed_hosts', () => {
		let allowedUrlsPrefix: string[];
		let modelMock: { findOneAndUpdate: jest.Mock };
		let service: PartnerResourcesService;

		const savedHosts = (): string[] =>
			modelMock.findOneAndUpdate.mock.calls[0][1].$set.allowedUrlsPrefix;

		beforeEach(() => {
			allowedUrlsPrefix = [
				'https://identifiers.org',
				'https://doi.org',
				'https://github.com',
			];
			modelMock = {
				findOneAndUpdate: jest
					.fn()
					.mockImplementation(async (_filter, update) => ({
						resource_id: 'disprot',
						...update.$set,
					})),
			};
			service = new PartnerResourcesService(
				{
					findOne: jest
						.fn()
						.mockImplementation(async () => ({ allowedUrlsPrefix })),
				} as any,
				{} as any,
				{} as any,
				modelMock as any,
			);
		});

		it('stores the host of an added URL and keeps the other hosts', async () => {
			await service.update_allowed_hosts('disprot', {
				add: ['https://www.disprot.org/entries'],
			});

			expect(modelMock.findOneAndUpdate).toHaveBeenCalledWith(
				{ resource_id: 'disprot' },
				expect.anything(),
				{ new: true },
			);
			expect(savedHosts()).toEqual([
				'https://identifiers.org',
				'https://doi.org',
				'https://github.com',
				'https://www.disprot.org',
			]);
		});

		it('does not add a host twice', async () => {
			await service.update_allowed_hosts('disprot', {
				add: [
					'https://doi.org/10.1000/1',
					'https://www.disprot.org',
					'https://www.disprot.org/x',
				],
			});

			expect(savedHosts()).toEqual([
				'https://identifiers.org',
				'https://doi.org',
				'https://github.com',
				'https://www.disprot.org',
			]);
		});

		it('removes entries by host, whatever form they are given in', async () => {
			await service.update_allowed_hosts('disprot', {
				remove: ['doi.org', 'https://identifiers.org/', 'unknown.org'],
			});

			expect(savedHosts()).toEqual(['https://github.com']);
		});

		it('refuses more than 20 hosts in total', async () => {
			allowedUrlsPrefix = Array.from(
				{ length: 19 },
				(_, i) => `https://host${i}.org`,
			);

			await expect(
				service.update_allowed_hosts('disprot', {
					add: ['https://a.org', 'https://b.org'],
				}),
			).rejects.toThrow(
				new BadRequestException(
					'A resource can allow at most 20 hosts, this change would make 21.',
				),
			);
			expect(modelMock.findOneAndUpdate).not.toHaveBeenCalled();
		});
	});
});
