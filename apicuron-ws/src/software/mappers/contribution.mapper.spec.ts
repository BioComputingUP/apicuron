import { mapPRPayloadToContributions } from './contribution.mapper';
import { PRPayloadDto } from '../dto/pr_payload.dto';

describe('mapPRPayloadToContributions', () => {
	const basePayload: PRPayloadDto = {
		event_type: 'pull_request',
		github_login: 'dev_user',
		contribution_id: 'contrib_1',
		resource_id: 'res_1',
		timestamp: '2026-07-29T10:00:00.000Z',
		repository: 'test',
		context: {
			pr_id: '101',
			pr_url: 'https://github.com/org/repo/pull/101',
			target_branch: 'main',
			labels: [],
			reviewers: [],
			title: 'Sample PR',
		},
	};

	it('should map author with generic_pr_activity when labels list is empty', () => {
		const result = mapPRPayloadToContributions(basePayload);

		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({
			github_login: 'dev_user',
			activity_term: 'generic_pr_activity',
			contribution_id: 'contrib_1',
			resource_id: 'res_1',
			entity_uri: 'https://github.com/org/repo/pull/101',
			timestamp: new Date('2026-07-29T10:00:00.000Z'),
		});
	});

	it('should map author to bug_fixing_activity when label contains bug', () => {
		const payload = {
			...basePayload,
			context: { ...basePayload.context, labels: ['kind/bug'] },
		};
		const result = mapPRPayloadToContributions(payload);

		expect(result).toHaveLength(1);
		expect(result[0].activity_term).toBe('bug_fixing_activity');
	});

	it('should map author to development_activity when label contains enhancement', () => {
		const payload = {
			...basePayload,
			context: { ...basePayload.context, labels: ['enhancement'] },
		};
		const result = mapPRPayloadToContributions(payload);

		expect(result).toHaveLength(1);
		expect(result[0].activity_term).toBe('development_activity');
	});

	it('should map author to documentation_activity when label contains documentation', () => {
		const payload = {
			...basePayload,
			context: { ...basePayload.context, labels: ['area/documentation'] },
		};
		const result = mapPRPayloadToContributions(payload);

		expect(result).toHaveLength(1);
		expect(result[0].activity_term).toBe('documentation_activity');
	});

	it('should map author to testing_activity when label contains test', () => {
		const payload = {
			...basePayload,
			context: { ...basePayload.context, labels: ['unit-test'] },
		};
		const result = mapPRPayloadToContributions(payload);

		expect(result).toHaveLength(1);
		expect(result[0].activity_term).toBe('testing_activity');
	});

	it('should map author to chore_activity when label contains chore or refactor', () => {
		const payloadChore = {
			...basePayload,
			context: { ...basePayload.context, labels: ['chore'] },
		};
		const payloadRefactor = {
			...basePayload,
			context: { ...basePayload.context, labels: ['refactor-code'] },
		};

		expect(mapPRPayloadToContributions(payloadChore)[0].activity_term).toBe(
			'chore_activity',
		);
		expect(mapPRPayloadToContributions(payloadRefactor)[0].activity_term).toBe(
			'chore_activity',
		);
	});

	it('should exclude author contribution when label contains duplicate or invalid', () => {
		const payloadDuplicate = {
			...basePayload,
			context: { ...basePayload.context, labels: ['duplicate'] },
		};
		const payloadInvalid = {
			...basePayload,
			context: { ...basePayload.context, labels: ['invalid'] },
		};

		expect(mapPRPayloadToContributions(payloadDuplicate)).toHaveLength(0);
		expect(mapPRPayloadToContributions(payloadInvalid)).toHaveLength(0);
	});

	it('should map reviewers to generic_review_activity', () => {
		const payload = {
			...basePayload,
			context: {
				...basePayload.context,
				reviewers: ['rev_1', 'rev_2'],
			},
		};
		const result = mapPRPayloadToContributions(payload);

		expect(result).toHaveLength(3); // 1 author + 2 reviewers
		expect(result[1]).toEqual({
			github_login: 'rev_1',
			activity_term: 'generic_review_activity',
			contribution_id: 'contrib_1',
			resource_id: 'res_1',
			entity_uri: 'https://github.com/org/repo/pull/101',
			timestamp: new Date('2026-07-29T10:00:00.000Z'),
		});
		expect(result[2].github_login).toBe('rev_2');
		expect(result[2].activity_term).toBe('generic_review_activity');
	});
});
