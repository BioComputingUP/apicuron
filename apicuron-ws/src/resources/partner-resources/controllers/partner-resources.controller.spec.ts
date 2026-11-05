/* eslint-disable @typescript-eslint/no-explicit-any */
import { ForbiddenException } from '@nestjs/common';
import { AuthService } from '../../../auth/auth.service';
import { PartnerResourcesController } from './partner-resources.controller';

describe('PartnerResourcesController', () => {
	const ORCID = '0000-0002-0341-4888';
	let serviceMock: { update_allowed_hosts: jest.Mock };
	let controller: PartnerResourcesController;

	const requestBy = (resource_ids: string[]) =>
		({
			user: {
				orcid_id: ORCID,
				resources: resource_ids.map((resource_id) => ({ resource_id })),
			},
		} as any);

	beforeEach(() => {
		serviceMock = {
			update_allowed_hosts: jest.fn().mockResolvedValue({
				resource_id: 'disprot',
				allowedUrlsPrefix: ['https://www.disprot.org'],
			}),
		};
		controller = new PartnerResourcesController(
			serviceMock as any,
			new AuthService({} as any, {} as any, {} as any),
		);
	});

	describe('update_allowed_hosts', () => {
		it('updates the hosts of a resource the user manages and returns them', async () => {
			const update = { add: ['https://www.disprot.org'] };

			const result = await controller.update_allowed_hosts(
				{ resource_id: 'disprot' },
				update,
				requestBy(['disprot']),
			);

			expect(serviceMock.update_allowed_hosts).toHaveBeenCalledWith(
				'disprot',
				update,
			);
			expect(result.allowedUrlsPrefix).toEqual(['https://www.disprot.org']);
		});

		it('refuses a resource the user does not manage', async () => {
			await expect(
				controller.update_allowed_hosts(
					{ resource_id: 'disprot' },
					{ add: ['https://www.disprot.org'] },
					requestBy(['mobidb']),
				),
			).rejects.toBeInstanceOf(ForbiddenException);
			expect(serviceMock.update_allowed_hosts).not.toHaveBeenCalled();
		});
	});
});
