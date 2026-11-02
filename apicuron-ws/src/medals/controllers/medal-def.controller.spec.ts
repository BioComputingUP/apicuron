/* eslint-disable @typescript-eslint/no-explicit-any */
import { ForbiddenException } from '@nestjs/common';
import { of } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { MedalsDefController } from './medal-def.controller';

describe('MedalsDefController POST achievements-def/medals/preview', () => {
	const preview = {
		medalDef: { resource_id: 'disprot' },
		skip: 0,
		limit: 10,
	} as any;
	const userManaging = (resource_id: string) => ({
		user: { resources: [{ resource_id }] },
	});

	let commands: { previewMedalsForDef: jest.Mock };
	let controller: MedalsDefController;

	beforeEach(() => {
		commands = { previewMedalsForDef: jest.fn().mockReturnValue(of([])) };
		controller = new MedalsDefController(
			{} as any,
			commands as any,
			{
				user_has_resource: AuthService.prototype.user_has_resource,
			} as any,
			{} as any,
		);
	});

	it('forbids previewing the medals of a resource the user does not manage', async () => {
		await expect(
			controller.previewMedalsforDef(preview, userManaging('another_resource')),
		).rejects.toThrow(ForbiddenException);

		expect(commands.previewMedalsForDef).not.toHaveBeenCalled();
	});

	it('lets a manager preview the medals of their resource', async () => {
		await controller.previewMedalsforDef(preview, userManaging('disprot'));

		expect(commands.previewMedalsForDef).toHaveBeenCalledWith(
			preview.medalDef,
			0,
			10,
		);
	});
});
