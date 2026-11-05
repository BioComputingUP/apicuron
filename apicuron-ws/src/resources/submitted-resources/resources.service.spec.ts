/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConflictException, NotFoundException } from '@nestjs/common';
import { SubmittedResourcesService } from './resources.service';

describe('SubmittedResourcesService.make_partner', () => {
	const ORCID = '0000-0002-0341-4888';
	const LOGO_PATH = 'resources/disprot.png';

	let steps: string[];
	let submitted: { findOne: jest.Mock };
	let partner: jest.Mock & { exists: jest.Mock };
	let collection: { updateOne: jest.Mock };
	let users: { addManagedResource: jest.Mock };
	let storage: any;
	let service: SubmittedResourcesService;

	const submittedDoc = (fields = {}) => ({
		resource_id: 'disprot',
		creator: ORCID,
		logo: `private://${LOGO_PATH}`,
		toObject: () => ({
			_id: 'id1',
			resource_id: 'disprot',
			state: 'SubmittedResource',
			...fields,
		}),
	});

	beforeEach(() => {
		steps = [];
		submitted = { findOne: jest.fn().mockResolvedValue(submittedDoc()) };
		partner = Object.assign(
			jest.fn().mockImplementation((data: Record<string, unknown>) => {
				const doc: Record<string, unknown> = { ...data };
				return Object.assign(doc, {
					validate: jest.fn(async () => steps.push('validate')),
					// the logo is set on the document after it is created
					toObject: () => ({
						...data,
						logo: doc.logo,
						state: 'PartnerResource',
					}),
				});
			}),
			{ exists: jest.fn().mockResolvedValue(null) },
		);
		collection = {
			updateOne: jest.fn(async () => {
				steps.push('update');
				return { modifiedCount: 1 };
			}),
		};
		users = {
			addManagedResource: jest.fn(async () => steps.push('manager')),
		};
		storage = {
			parseCanonicalUrl: (url: string) => ({ path: url.split('://')[1] }),
			move: jest.fn(async (_s, _d, path) => {
				steps.push('copy');
				return path;
			}),
			getEngine: jest.fn(() => ({
				buildCanonicalUrl: (path: string) => `public://${path}`,
				delete: jest.fn(async () => steps.push('delete')),
			})),
		};
		service = new SubmittedResourcesService(
			submitted as any,
			{ collection } as any,
			partner as any,
			users as any,
			{} as any,
			storage,
		);
	});

	it('copies the logo, switches the document, adds the manager, then deletes the private logo', async () => {
		await service.make_partner('disprot');

		expect(steps).toEqual(['validate', 'copy', 'update', 'manager', 'delete']);
		expect(storage.move).toHaveBeenCalledWith('private', 'public', LOGO_PATH, {
			deleteFromSource: false,
		});
		const [filter, update] = collection.updateOne.mock.calls[0] as [
			unknown,
			{ $set: Record<string, unknown> },
		];
		expect(filter).toEqual({ _id: 'id1', state: 'SubmittedResource' });
		expect(update.$set).toMatchObject({
			resource_id: 'disprot',
			state: 'PartnerResource',
			logo: `public://${LOGO_PATH}`,
		});
		expect(update.$set._id).toBeUndefined();
	});

	it('does not pass the submitted state to the partner document', async () => {
		await service.make_partner('disprot');

		expect(partner.mock.calls[0][0].state).toBeUndefined();
	});

	it('refuses an approved resource without changing anything', async () => {
		submitted.findOne.mockResolvedValue(null);
		partner.exists.mockResolvedValue({ _id: 'id1' });

		await expect(service.make_partner('disprot')).rejects.toThrow(
			ConflictException,
		);
		expect(steps).toEqual([]);
	});

	it('refuses an unknown resource', async () => {
		submitted.findOne.mockResolvedValue(null);

		await expect(service.make_partner('disprot')).rejects.toThrow(
			NotFoundException,
		);
	});

	it('keeps the private logo when the document was not switched', async () => {
		collection.updateOne.mockResolvedValue({ modifiedCount: 0 });

		await expect(service.make_partner('disprot')).rejects.toThrow(
			ConflictException,
		);
		expect(steps).toEqual(['validate', 'copy']);
	});

	it('still approves when the manager or the logo cleanup fails', async () => {
		users.addManagedResource.mockRejectedValue(new Error('db down'));
		storage.getEngine.mockReturnValue({
			buildCanonicalUrl: (path: string) => `public://${path}`,
			delete: jest.fn().mockRejectedValue(new Error('disk')),
		});

		await expect(service.make_partner('disprot')).resolves.toBeUndefined();
		expect(steps).toEqual(['validate', 'copy', 'update']);
	});
});
