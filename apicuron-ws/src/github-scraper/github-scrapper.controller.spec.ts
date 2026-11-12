import { UnauthorizedException } from '@nestjs/common';
import { GithubScraperController } from './github-scrapper.controller';

// the real service loads undici, which needs web streams the test environment does not have
jest.mock('./github-scraper.service', () => ({
	GithubScraperService: class {},
}));

function call(github_token: string | undefined, authorization?: string) {
	const service = {
		getProfilePage: jest
			.fn()
			.mockResolvedValue({ orcid_id: 'x', orcidUrl: 'y' }),
	};
	const controller = new GithubScraperController(service as any, {
		github_token,
	});
	return controller.getScraperData('someone', {
		headers: { authorization },
	} as any);
}

describe('GithubScraperController', () => {
	it('accepts the configured token', async () => {
		await expect(call('secret', 'tokenKey secret')).resolves.toBeDefined();
	});

	it('rejects a wrong token', async () => {
		await expect(call('secret', 'tokenKey other')).rejects.toBeInstanceOf(
			UnauthorizedException,
		);
	});

	it('rejects every request when no token is configured', async () => {
		await expect(call(undefined, 'tokenKey undefined')).rejects.toBeInstanceOf(
			UnauthorizedException,
		);
		await expect(call(undefined)).rejects.toBeInstanceOf(UnauthorizedException);
	});
});
