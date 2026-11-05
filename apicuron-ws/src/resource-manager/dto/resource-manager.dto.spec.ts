import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AddManagerDto } from './resource-manager.dto';

describe('AddManagerDto', () => {
	// the same options as the global ValidationPipe
	const errorsFor = async (body: object) => {
		const errors = await validate(plainToInstance(AddManagerDto, body), {
			stopAtFirstError: true,
			whitelist: true,
		});
		return errors.flatMap((e) => Object.values(e.constraints ?? {}));
	};

	it('accepts a valid ORCID iD', async () => {
		await expect(
			errorsFor({ orcid_id: '0000-0002-0341-4888' }),
		).resolves.toEqual([]);
	});

	it('rejects a wrong check digit', async () => {
		await expect(
			errorsFor({ orcid_id: '0000-0002-0341-4889' }),
		).resolves.toEqual([
			'Failed Orcid Checksum validation on (0000-0002-0341-4889)',
		]);
	});

	it('reports the format, not a crash, when the ORCID iD is missing', async () => {
		await expect(errorsFor({})).resolves.toEqual([
			'orcid_id must be an ORCID iD like 0000-0002-0341-4888',
		]);
	});
});
