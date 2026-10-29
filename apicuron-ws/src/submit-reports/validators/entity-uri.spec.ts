/* eslint-disable @typescript-eslint/no-explicit-any */
import { NotFoundException } from '@nestjs/common';
import { ValidationArguments } from 'class-validator';
import { EntityUriValid } from './entity-uri';

describe('EntityUriValid', () => {
	const RESOURCE = {
		resource_id: 'disprot',
		resource_uri: 'https://registry.identifiers.org/registry/disprot',
		resource_url: 'https://disprot.org/',
		allowedUrlsPrefix: ['https://identifiers.org'],
	};

	let validator: EntityUriValid;
	let resourcesMock: { get_resource: jest.Mock };

	const argsFor = (resource_id?: string): ValidationArguments =>
		({
			constraints: [(report: { resource_id?: string }) => report.resource_id],
			object: { resource_id },
			property: 'entity_uri',
		} as any);

	beforeEach(() => {
		resourcesMock = { get_resource: jest.fn().mockResolvedValue(RESOURCE) };
		validator = new EntityUriValid(
			resourcesMock as any,
			{ get: jest.fn().mockReturnValue('local') } as any,
		);
	});

	it('accepts an entity_uri on a host of the resource', async () => {
		await expect(
			validator.validate(
				'https://identifiers.org/disprot:DP00034',
				argsFor('disprot'),
			),
		).resolves.toBe(true);
		await expect(
			validator.validate('https://disprot.org/DP00034', argsFor('disprot')),
		).resolves.toBe(true);
	});

	it('rejects an entity_uri on a host foreign to the resource', async () => {
		await expect(
			validator.validate('https://example.com/DP00034', argsFor('disprot')),
		).resolves.toBe(false);
	});

	it('skips the check without looking up a resource when resource_id is missing', async () => {
		await expect(
			validator.validate('https://example.com/DP00034', argsFor(undefined)),
		).resolves.toBe(true);
		expect(resourcesMock.get_resource).not.toHaveBeenCalled();
	});

	it('skips the check when the resource does not exist', async () => {
		resourcesMock.get_resource.mockRejectedValue(
			new NotFoundException('Resource with ID unknown not found.'),
		);

		await expect(
			validator.validate('https://example.com/DP00034', argsFor('unknown')),
		).resolves.toBe(true);
	});

	it('propagates unexpected lookup errors', async () => {
		resourcesMock.get_resource.mockRejectedValue(new Error('connection lost'));

		await expect(
			validator.validate('https://example.com/DP00034', argsFor('disprot')),
		).rejects.toThrow('connection lost');
	});

	it('names the resource in the error message', () => {
		expect(validator.defaultMessage(argsFor('disprot'))).toBe(
			'"entity_uri" must share the same host as the resource "disprot"',
		);
	});
});
