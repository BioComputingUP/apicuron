import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateAllowedHostsDto } from './allowed-hosts.dto';

describe('UpdateAllowedHostsDto', () => {
	const errorsFor = async (body: object) =>
		(await validate(plainToInstance(UpdateAllowedHostsDto, body))).flatMap(
			(error) => Object.values(error.constraints ?? {}),
		);

	it('accepts https URLs with a domain name and bare hosts to remove', async () => {
		await expect(
			errorsFor({
				add: ['https://www.disprot.org', 'https://doi.org/10.1000/1'],
				remove: ['doi.org', 'https://identifiers.org/'],
			}),
		).resolves.toEqual([]);
	});

	it.each([
		'http://www.disprot.org',
		'www.disprot.org',
		'https://localhost',
		'https://*.disprot.org',
		'https://127.0.0.1',
		'https://[::1]',
		'https://user:password@disprot.org',
	])('rejects %s', async (url) => {
		await expect(errorsFor({ add: [url] })).resolves.toEqual([
			'add must only contain https URLs with a domain name, e.g. https://www.disprot.org',
		]);
	});

	it('rejects more than 20 hosts at once', async () => {
		await expect(
			errorsFor({ add: Array(21).fill('https://doi.org') }),
		).resolves.toHaveLength(1);
	});
});
