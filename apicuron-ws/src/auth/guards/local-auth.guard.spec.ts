/* eslint-disable @typescript-eslint/no-explicit-any */
import { ForbiddenException } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';

describe('LocalAuthGuard', () => {
	let usersService: { getPrivateUser: jest.Mock };
	let isPublic: boolean;
	let guard: LocalAuthGuard;

	const contextFor = (headers: Record<string, string>) =>
		({
			switchToHttp: () => ({ getRequest: () => ({ headers }) }),
			getHandler: () => undefined,
			getClass: () => undefined,
		} as any);

	const failureFor = async (headers: Record<string, string>) => {
		const error = await guard.canActivate(contextFor(headers)).catch((e) => e);
		expect(error).toBeInstanceOf(ForbiddenException);
		return (error as ForbiddenException).message;
	};

	beforeEach(() => {
		isPublic = false;
		usersService = { getPrivateUser: jest.fn().mockResolvedValue(null) };
		guard = new LocalAuthGuard(
			usersService as any,
			{} as any,
			{} as any,
			{ getAllAndOverride: () => isPublic } as any,
		);
		jest.spyOn(guard, 'checkJwtAuth').mockResolvedValue(false);
	});

	afterEach(() => jest.restoreAllMocks());

	it('lets a valid token through', async () => {
		jest.spyOn(guard, 'checkJwtAuth').mockResolvedValue(true);

		await expect(
			guard.canActivate(contextFor({ authorization: 'Bearer abc' })),
		).resolves.toBe(true);
	});

	it('lets anyone through on a public route', async () => {
		isPublic = true;

		await expect(guard.canActivate(contextFor({}))).resolves.toBe(true);
	});

	it('asks for a token when there is none', async () => {
		expect(await failureFor({})).toBe(
			'This endpoint needs an API token. Send: Authorization: Bearer <token>',
		);
	});

	it('points out a token sent without the Bearer prefix', async () => {
		expect(await failureFor({ authorization: 'abc.def.ghi' })).toContain(
			'Your token has no "Bearer " prefix',
		);
	});

	it('says when the token is not valid on this site', async () => {
		expect(await failureFor({ authorization: 'Bearer abc.def.ghi' })).toContain(
			'This API token is not valid on this site',
		);
		expect(await failureFor({ 'orcid-token': 'unknown' })).toContain(
			'This API token is not valid on this site',
		);
	});
});
