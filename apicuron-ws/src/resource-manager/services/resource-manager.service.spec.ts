/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ResourceManagerService } from './resource-manager.service';

describe('ResourceManagerService', () => {
	const ORCID = '0000-0002-1825-0097';
	const RESOURCE = { resource_id: 'disprot', resource_name: 'DisProt' };
	const managedEntry = { resource_id: 'disprot', name: 'DisProt' };

	let service: ResourceManagerService;
	let usersMock: {
		findOne: jest.Mock;
		updateOne: jest.Mock;
		count: jest.Mock;
		find: jest.Mock;
	};
	let resourcesMock: { findOne: jest.Mock };

	beforeEach(() => {
		usersMock = {
			findOne: jest.fn().mockResolvedValue({ orcid_id: ORCID, resources: [] }),
			updateOne: jest.fn().mockResolvedValue({ orcid_id: ORCID }),
			count: jest.fn().mockResolvedValue(2),
			find: jest.fn().mockResolvedValue([]),
		};
		resourcesMock = { findOne: jest.fn().mockResolvedValue(RESOURCE) };
		service = new ResourceManagerService(
			usersMock as any,
			resourcesMock as any,
		);
	});

	describe('addManager', () => {
		it('adds the resource to a known user', async () => {
			await expect(service.addManager('disprot', ORCID)).resolves.toEqual({
				added: true,
			});

			expect(usersMock.updateOne).toHaveBeenCalledWith(
				{ orcid_id: ORCID, 'resources.resource_id': { $ne: 'disprot' } },
				{ $push: { resources: managedEntry } },
			);
		});

		it('handles users without a resources array', async () => {
			usersMock.findOne.mockResolvedValue({ orcid_id: ORCID });

			await expect(service.addManager('disprot', ORCID)).resolves.toEqual({
				added: true,
			});
		});

		it('is a no-op when the user already manages the resource', async () => {
			usersMock.findOne.mockResolvedValue({
				orcid_id: ORCID,
				resources: [managedEntry],
			});

			await expect(service.addManager('disprot', ORCID)).resolves.toEqual({
				added: false,
			});
			expect(usersMock.updateOne).not.toHaveBeenCalled();
		});

		it('rejects an unknown resource', async () => {
			resourcesMock.findOne.mockResolvedValue(null);

			await expect(service.addManager('unknown', ORCID)).rejects.toThrow(
				NotFoundException,
			);
			expect(usersMock.updateOne).not.toHaveBeenCalled();
		});

		it('rejects an ORCID iD that never logged in', async () => {
			usersMock.findOne.mockResolvedValue(null);

			await expect(service.addManager('disprot', ORCID)).rejects.toThrow(
				NotFoundException,
			);
			expect(usersMock.updateOne).not.toHaveBeenCalled();
		});

		it('reports a concurrent modification of the user', async () => {
			usersMock.updateOne.mockResolvedValue(null);

			await expect(service.addManager('disprot', ORCID)).rejects.toThrow(
				ConflictException,
			);
		});
	});

	describe('removeManager', () => {
		beforeEach(() => {
			usersMock.findOne.mockResolvedValue({
				orcid_id: ORCID,
				resources: [managedEntry],
			});
		});

		it('pulls the resource from the user', async () => {
			await expect(service.removeManager('disprot', ORCID)).resolves.toEqual({
				removed: true,
			});

			expect(usersMock.updateOne).toHaveBeenCalledWith(
				{ orcid_id: ORCID },
				{ $pull: { resources: { resource_id: 'disprot' } } },
			);
		});

		it('is a no-op when the user does not manage the resource', async () => {
			usersMock.findOne.mockResolvedValue({ orcid_id: ORCID, resources: [] });

			await expect(service.removeManager('disprot', ORCID)).resolves.toEqual({
				removed: false,
			});
			expect(usersMock.updateOne).not.toHaveBeenCalled();
		});

		it('refuses to remove the last manager', async () => {
			usersMock.count.mockResolvedValue(1);

			await expect(service.removeManager('disprot', ORCID)).rejects.toThrow(
				ConflictException,
			);
			expect(usersMock.updateOne).not.toHaveBeenCalled();
		});

		it('rejects an unknown user', async () => {
			usersMock.findOne.mockResolvedValue(null);

			await expect(service.removeManager('disprot', ORCID)).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe('listManagers', () => {
		it('returns the users managing the resource', async () => {
			usersMock.find.mockResolvedValue([
				{ orcid_id: ORCID, displayedName: 'Josiah Carberry', role: 'user' },
			]);

			await expect(service.listManagers('disprot')).resolves.toEqual([
				{ orcid_id: ORCID, displayedName: 'Josiah Carberry' },
			]);
			expect(usersMock.find).toHaveBeenCalledWith(
				{ 'resources.resource_id': 'disprot' },
				{ orcid_id: 1, displayedName: 1 },
			);
		});
	});
});
