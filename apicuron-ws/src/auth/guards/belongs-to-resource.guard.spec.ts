/* eslint-disable @typescript-eslint/no-explicit-any */
import { ForbiddenException } from '@nestjs/common';
import { HasAResourceGuard } from './belongs-to-resource.guard';

describe('HasAResourceGuard', () => {
	const ORCID = '0000-0002-1825-0097';
	let usersService: { getByOrcid: jest.Mock };
	let guard: HasAResourceGuard;

	const contextFor = (user?: { orcid_id: string }) =>
		({ switchToHttp: () => ({ getRequest: () => ({ user }) }) } as any);

	beforeEach(() => {
		usersService = { getByOrcid: jest.fn() };
		guard = new HasAResourceGuard(usersService as any);
	});

	it('lets a resource manager through', async () => {
		usersService.getByOrcid.mockResolvedValue({
			resources: [{ resource_id: 'disprot' }],
		});

		await expect(
			guard.canActivate(contextFor({ orcid_id: ORCID })),
		).resolves.toBe(true);
	});

	it('tells an account with no resource how to get one', async () => {
		usersService.getByOrcid.mockResolvedValue({ resources: [] });

		const error = await guard
			.canActivate(contextFor({ orcid_id: ORCID }))
			.catch((e) => e);

		expect(error).toBeInstanceOf(ForbiddenException);
		expect(error.message).toBe(
			`Your account (${ORCID}) manages no resource. Ask a manager of your resource to add you, or create one at /resources/create.`,
		);
	});

	it('refuses a request without a user', async () => {
		await expect(guard.canActivate(contextFor())).resolves.toBe(false);
	});
});
