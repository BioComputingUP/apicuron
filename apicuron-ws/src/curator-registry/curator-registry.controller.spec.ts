/* eslint-disable @typescript-eslint/no-explicit-any */
import { Logger, NotFoundException } from '@nestjs/common';
import { PrivacyType } from 'src/core/enums';
import { CuratorRegistryController } from './curator-registry.controller';
import { RegistryQueryService } from './services/registry-query.service';
import { RegistryFilterStrategy } from './strategies/registry-filter.strategy';

describe('CuratorRegistryController GET registry/curator/:id', () => {
	const CONTRIBUTOR = '0000-0002-0341-4888';
	const contribution = (
		resource_id: string,
		visibility: PrivacyType = PrivacyType.public,
	) => ({
		resource_id,
		resource: { resource_id },
		groups: [{ name: 'default', resource_id, visibility }],
	});
	const entry = (privacy: PrivacyType, contributed_to: unknown[]) => ({
		curator_orcid: CONTRIBUTOR,
		privacy,
		curator: { orcid_id: CONTRIBUTOR, displayedName: 'A Contributor', privacy },
		contributed_to,
	});
	const manager = (...resource_ids: string[]) =>
		({
			orcid_id: '0000-0001-5109-3700',
			resources: resource_ids.map((resource_id) => ({ resource_id })),
		} as any);

	let findOne: jest.Mock;
	let controller: CuratorRegistryController;

	const get = (user: unknown) => controller.getCuratorEntry(CONTRIBUTOR, user as any);
	const resourcesOf = (result: { contributed_to: any[] }) =>
		result.contributed_to.map((contribution) => contribution.resource_id);
	const stored = (value: unknown) =>
		findOne.mockReturnValue({ lean: () => Promise.resolve(value) });

	beforeEach(() => {
		jest.spyOn(Logger.prototype, 'log').mockImplementation();
		jest.spyOn(Logger.prototype, 'debug').mockImplementation();
		jest.spyOn(Logger.prototype, 'verbose').mockImplementation();
		findOne = jest.fn();
		controller = new CuratorRegistryController(
			new RegistryQueryService(
				{ findOne } as any,
				new RegistryFilterStrategy(),
			),
		);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('for a private profile', () => {
		const contributions = [contribution('disprot'), contribution('other')];

		it('responds with a 404 to anonymous users', async () => {
			stored(entry(PrivacyType.private, contributions));

			await expect(get(undefined)).rejects.toThrow(NotFoundException);
		});

		it('responds with a 404 to users managing none of the contributed resources', async () => {
			stored(entry(PrivacyType.private, contributions));

			await expect(get(manager('unrelated'))).rejects.toThrow(NotFoundException);
		});

		it('only shows a manager the contributions to their own resources', async () => {
			stored(entry(PrivacyType.private, contributions));

			const result = await get(manager('disprot'));

			expect(resourcesOf(result)).toEqual(['disprot']);
		});

		it('shows the contributor their whole entry', async () => {
			stored(entry(PrivacyType.private, contributions));

			const result = await get({ orcid_id: CONTRIBUTOR, resources: [] });

			expect(resourcesOf(result)).toEqual(['disprot', 'other']);
		});
	});

	describe('for a public profile', () => {
		const contributions = [
			contribution('disprot'),
			contribution('secret', PrivacyType.private),
		];

		it('hides the private groups from anonymous users', async () => {
			stored(entry(PrivacyType.public, contributions));

			expect(resourcesOf(await get(undefined))).toEqual(['disprot']);
		});

		it('shows the private groups to the managers of their resource', async () => {
			stored(entry(PrivacyType.public, contributions));

			expect(resourcesOf(await get(manager('secret')))).toEqual([
				'disprot',
				'secret',
			]);
		});

		it('still shows the profile when it has no visible contributions', async () => {
			stored(entry(PrivacyType.public, []));

			expect(resourcesOf(await get(undefined))).toEqual([]);
		});
	});

	it('responds with a 404 when the contributor does not exist', async () => {
		stored(null);

		await expect(get(manager('disprot'))).rejects.toThrow(NotFoundException);
	});
});
