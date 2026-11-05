import { ForbiddenException } from '@nestjs/common';
import { assertUserManagesResource } from './authrization.helpers';

describe('assertUserManagesResource', () => {
	const ORCID = '0000-0002-0341-4888';
	const manager = {
		orcid_id: ORCID,
		resources: [{ resource_id: 'disprot' }, { resource_id: 'mobidb' }],
	};

	it('accepts the resources the user manages', () => {
		expect(() =>
			assertUserManagesResource(manager, ['disprot', 'mobidb']),
		).not.toThrow();
	});

	it('names the managed resources and the forbidden ones', () => {
		expect(() =>
			assertUserManagesResource(manager, ['disprot', 'pdb', 'pdb', 'uniprot']),
		).toThrow(
			new ForbiddenException(
				`Your account (${ORCID}) does not manage "pdb", "uniprot". It manages [disprot, mobidb].`,
			),
		);
	});

	it('accepts any resource for an admin', () => {
		expect(() =>
			assertUserManagesResource(
				{ orcid_id: ORCID, role: 'admin', resources: [] },
				['disprot', 'pdb'],
			),
		).not.toThrow();
	});

	it('says when the user manages no resource', () => {
		expect(() =>
			assertUserManagesResource({ orcid_id: ORCID, resources: [] }, 'disprot'),
		).toThrow(
			`Your account (${ORCID}) does not manage "disprot". It manages no resource.`,
		);
	});
});
