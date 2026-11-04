/* eslint-disable @typescript-eslint/no-explicit-any */
import { ForbiddenException } from '@nestjs/common';
import { User } from 'src/core/schemas/user.schema';
import { ResourceManagersController } from './resource-managers.controller';

describe('ResourceManagersController', () => {
	const ALICE = { orcid_id: '0000-0002-1825-0097', displayedName: 'Alice' };
	const BOB = { orcid_id: '0000-0001-5109-3700', displayedName: 'Bob' };
	const caller = {
		...ALICE,
		resources: [{ resource_id: 'disprot' }],
	} as unknown as User;

	let managers: {
		addManager: jest.Mock;
		removeManager: jest.Mock;
		listManagers: jest.Mock;
	};
	let notifications: { create_user_notification: jest.Mock };
	let controller: ResourceManagersController;

	const notified = () =>
		notifications.create_user_notification.mock.calls.map(
			([, , orcid_id]) => orcid_id as string,
		);

	beforeEach(() => {
		managers = {
			addManager: jest.fn().mockResolvedValue({ added: true }),
			removeManager: jest.fn().mockResolvedValue({ removed: true }),
			listManagers: jest.fn().mockResolvedValue([ALICE, BOB]),
		};
		notifications = { create_user_notification: jest.fn() };
		controller = new ResourceManagersController(
			managers as any,
			{
				findOne: jest.fn().mockResolvedValue({ resource_name: 'DisProt' }),
			} as any,
			notifications as any,
		);
	});

	it('refuses a user who does not manage the resource', async () => {
		await expect(
			controller.add_manager(
				{ resource_id: 'pdb' },
				{ orcid_id: BOB.orcid_id },
				caller,
			),
		).rejects.toThrow(ForbiddenException);
		expect(managers.addManager).not.toHaveBeenCalled();
	});

	it('lets an admin list any resource', async () => {
		await expect(
			controller.list_managers({ resource_id: 'pdb' }, {
				...BOB,
				role: 'admin',
				resources: [],
			} as any),
		).resolves.toEqual([ALICE, BOB]);
	});

	it('notifies every manager with the names of who added whom', async () => {
		const result = await controller.add_manager(
			{ resource_id: 'disprot' },
			{ orcid_id: BOB.orcid_id },
			caller,
		);

		expect(result).toEqual([ALICE, BOB]);
		expect(notifications.create_user_notification).toHaveBeenCalledWith(
			'Managers of DisProt changed',
			`Alice (${ALICE.orcid_id}) added Bob (${BOB.orcid_id}) as a manager of DisProt.`,
			BOB.orcid_id,
		);
		expect(notified().sort()).toEqual([ALICE.orcid_id, BOB.orcid_id].sort());
	});

	it('also notifies the removed manager', async () => {
		managers.listManagers
			.mockResolvedValueOnce([ALICE, BOB])
			.mockResolvedValueOnce([ALICE]);

		const result = await controller.remove_manager(
			{ resource_id: 'disprot', orcid_id: BOB.orcid_id },
			caller,
		);

		expect(result).toEqual([ALICE]);
		expect(notifications.create_user_notification).toHaveBeenCalledWith(
			'Managers of DisProt changed',
			`Alice (${ALICE.orcid_id}) removed Bob (${BOB.orcid_id}) from the managers of DisProt.`,
			BOB.orcid_id,
		);
		expect(notified().sort()).toEqual([ALICE.orcid_id, BOB.orcid_id].sort());
	});

	it('does not notify when nothing changed', async () => {
		managers.addManager.mockResolvedValue({ added: false });

		await controller.add_manager(
			{ resource_id: 'disprot' },
			{ orcid_id: BOB.orcid_id },
			caller,
		);

		expect(notifications.create_user_notification).not.toHaveBeenCalled();
	});
});
