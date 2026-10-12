/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConflictException, Logger } from '@nestjs/common';
import { ContributorIdentifierType, EventOutputKind, EventOutputStatus } from 'src/core/enums';
import { ContributionEventOutput } from '../entities/contribution-event.entity';
import { GITHUB_PR_MERGED_TYPE, INTERPRETER_VERSION } from '../interpretation/github-pr.interpreter';
import { ContributionEventProcessor } from './contribution-event-processor.service';

const events: any[] = require('../interpretation/__fixtures__/disprot-events.json');

describe('ContributionEventProcessor', () => {
	// PR #115: author geekn0rd (typed from the closing issue), reviewer/commenter/merger adelbke
	const payload = events.find((e) => e.subject === 'pull_request/115');
	const AUTHOR_ID = '70889826';
	const OTHER_ID = '39879172';
	const ORCID = '0000-0002-1825-0097';

	let processor: ContributionEventProcessor;
	let eventsMock: { findById: jest.Mock; markProcessed: jest.Mock; markFailed: jest.Mock };
	let identityMock: { findOrcidByGithubId: jest.Mock };
	let submitMock: { insertReport: jest.Mock };
	let pendingMock: { createPendingReport: jest.Mock };

	const recordedOutputs = (): ContributionEventOutput[] =>
		eventsMock.markProcessed.mock.calls[0]?.[2] ?? eventsMock.markFailed.mock.calls[0]?.[2];

	beforeEach(() => {
		jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
		eventsMock = {
			findById: jest.fn().mockResolvedValue({
				id: 'evt_1',
				type: GITHUB_PR_MERGED_TYPE,
				resource_id: 'disprot',
				payload,
			}),
			markProcessed: jest.fn().mockResolvedValue(undefined),
			markFailed: jest.fn().mockResolvedValue(undefined),
		};
		identityMock = { findOrcidByGithubId: jest.fn().mockResolvedValue(null) };
		submitMock = { insertReport: jest.fn().mockResolvedValue(undefined) };
		pendingMock = { createPendingReport: jest.fn().mockResolvedValue(undefined) };
		processor = new ContributionEventProcessor(
			eventsMock as any,
			identityMock as any,
			submitMock as any,
			pendingMock as any,
		);
	});

	afterEach(() => jest.restoreAllMocks());

	it('records contributor_github_id on PENDING outputs', async () => {
		await processor.process('evt_1');

		expect(eventsMock.markProcessed).toHaveBeenCalledWith('evt_1', INTERPRETER_VERSION, expect.any(Array));
		const outputs = recordedOutputs();
		expect(outputs).toHaveLength(4);
		for (const output of outputs) {
			expect(output.kind).toBe(EventOutputKind.PENDING);
			expect(output.contributor_identifier_type).toBe(ContributorIdentifierType.GITHUB);
			expect(output.contributor_github_id).toBe(output.contributor_identifier);
		}
		expect(outputs.map((o) => o.contributor_github_id).sort()).toEqual([OTHER_ID, OTHER_ID, OTHER_ID, AUTHOR_ID]);
	});

	it('records contributor_github_id on REPORT outputs identified by ORCID iD', async () => {
		identityMock.findOrcidByGithubId.mockImplementation(async (id: string) => (id === AUTHOR_ID ? ORCID : null));

		await processor.process('evt_1');

		const outputs = recordedOutputs();
		const report = outputs.filter((o) => o.kind === EventOutputKind.REPORT);
		expect(report).toHaveLength(1);
		expect(report[0].contributor_identifier).toBe(ORCID);
		expect(report[0].contributor_identifier_type).toBe(ContributorIdentifierType.ORCID);
		expect(report[0].contributor_github_id).toBe(AUTHOR_ID);
		for (const output of outputs) {
			expect(output.contributor_github_id).toMatch(/^\d+$/);
		}
	});

	it('keeps contributor_github_id on ALREADY_EXISTED and FAILED outputs', async () => {
		identityMock.findOrcidByGithubId.mockImplementation(async (id: string) => (id === AUTHOR_ID ? ORCID : null));
		submitMock.insertReport.mockRejectedValue(new ConflictException('duplicate'));
		pendingMock.createPendingReport.mockRejectedValue(new Error('boom'));

		await processor.process('evt_1');

		expect(eventsMock.markProcessed).not.toHaveBeenCalled();
		const outputs = recordedOutputs();
		expect(outputs.map((o) => o.status).sort()).toEqual([
			EventOutputStatus.ALREADY_EXISTED,
			EventOutputStatus.FAILED,
			EventOutputStatus.FAILED,
			EventOutputStatus.FAILED,
		]);
		for (const output of outputs) {
			expect(output.contributor_github_id).toMatch(/^\d+$/);
		}
		expect(outputs.find((o) => o.status === EventOutputStatus.ALREADY_EXISTED)?.contributor_github_id).toBe(AUTHOR_ID);
	});

	it('copies type_source to the authored output only', async () => {
		await processor.process('evt_1');

		const outputs = recordedOutputs();
		const typed = outputs.filter((o) => 'type_source' in o);
		expect(typed).toHaveLength(1);
		expect(typed[0].contributor_github_id).toBe(AUTHOR_ID);
		expect(typed[0].activity_term).toBe('feature_building');
		expect(typed[0].type_source).toBe('issue_label');
	});

	it('does not pass the new fields to reports or pending reports', async () => {
		identityMock.findOrcidByGithubId.mockImplementation(async (id: string) => (id === AUTHOR_ID ? ORCID : null));

		await processor.process('evt_1');

		expect(submitMock.insertReport).toHaveBeenCalledTimes(1);
		expect(pendingMock.createPendingReport).toHaveBeenCalledTimes(3);
		for (const [arg] of [...submitMock.insertReport.mock.calls, ...pendingMock.createPendingReport.mock.calls]) {
			expect(arg).not.toHaveProperty('contributor_github_id');
			expect(arg).not.toHaveProperty('type_source');
		}
	});
});
