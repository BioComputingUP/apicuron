import { Test, TestingModule } from '@nestjs/testing';
import { PrContributionProcessor } from './pr_closed.processor';
import { GithubOrcidResolver } from '../helpers/github-orcid.resolver';
import { SubmitReportService } from 'src/submit-reports/services/submit-reports.service';
import { PRPayloadDto } from '../dto/pr_payload.dto';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { PendingReportsService } from 'src/pending_reports/services/pending-reports.service';
import { ContributorIdentifierType } from 'src/core/enums';

describe('PrContributionProcessor', () => {
	let processor: PrContributionProcessor;
	let orcidResolverMock: { resolve: jest.Mock };
	let submitReportsServiceMock: { insertReport: jest.Mock };
	let pendingReportsServiceMock: { createPendingReport: jest.Mock };

	const mockPayload: PRPayloadDto = {
		event_type: 'pull_request',
		github_login: 'author_user',
		contribution_id: 'contrib_123',
		resource_id: 'res_456',
		repository: 'test-repo',
		timestamp: '2026-07-29T10:00:00.000Z',
		context: {
			pr_id: 'pr_1',
			pr_url: 'https://github.com/org/repo/pull/1',
			target_branch: 'main',
			labels: ['bug'],
			reviewers: ['reviewer_user', 'reviewer2'],
			title: 'Fix issue',
		},
	};

	beforeEach(async () => {
		orcidResolverMock = {
			resolve: jest.fn().mockImplementation(async (login: string | null) => {
				if (login === 'author_user') return '0000-0001-1111-2222';
				if (login === 'reviewer_user') return '0000-0002-2222-3333';
				return null;
			}),
		};

		submitReportsServiceMock = {
			insertReport: jest.fn().mockResolvedValue({
				report: {} as unknown,
			}),
		};
		pendingReportsServiceMock = {
			createPendingReport: jest.fn().mockResolvedValue(null),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PrContributionProcessor,
				{
					provide: GithubOrcidResolver,
					useValue: orcidResolverMock,
				},
				{
					provide: SubmitReportService,
					useValue: submitReportsServiceMock,
				},
				{
					provide: PendingReportsService,
					useValue: pendingReportsServiceMock,
				},
			],
		}).compile();

		processor = module.get<PrContributionProcessor>(PrContributionProcessor);
		jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
		jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should process contributions and submit reports for resolved ORCIDs', async () => {
		await processor.process(mockPayload);

		expect(orcidResolverMock.resolve).toHaveBeenCalledTimes(3);
		expect(orcidResolverMock.resolve).toHaveBeenCalledWith('author_user');
		expect(orcidResolverMock.resolve).toHaveBeenCalledWith('reviewer_user');
		expect(orcidResolverMock.resolve).toHaveBeenCalledWith('reviewer2');

		expect(submitReportsServiceMock.insertReport).toHaveBeenCalledTimes(2);
		expect(submitReportsServiceMock.insertReport).toHaveBeenNthCalledWith(1, {
			activity_term: 'bug_fixing_activity',
			curator_orcid: '0000-0001-1111-2222',
			entity_uri: 'https://github.com/org/repo/pull/1',
			resource_id: 'res_456',
			timestamp: new Date('2026-07-29T10:00:00.000Z'),
			league: 'default',
		});
		expect(submitReportsServiceMock.insertReport).toHaveBeenNthCalledWith(2, {
			activity_term: 'generic_review_activity',
			curator_orcid: '0000-0002-2222-3333',
			entity_uri: 'https://github.com/org/repo/pull/1',
			resource_id: 'res_456',
			timestamp: new Date('2026-07-29T10:00:00.000Z'),
			league: 'default',
		});
	});

	it('should skip contribution when ORCID resolution returns null', async () => {
		orcidResolverMock.resolve.mockResolvedValueOnce(null);

		await processor.process(mockPayload);

		expect(Logger.prototype.warn).toHaveBeenCalledWith(
			expect.stringContaining(
				'Could not resolve ORCID for github_login: author_user',
			),
		);

		expect(submitReportsServiceMock.insertReport).toHaveBeenCalledTimes(1);
		expect(submitReportsServiceMock.insertReport).toHaveBeenCalledWith(
			expect.objectContaining({
				curator_orcid: '0000-0002-2222-3333',
			}),
		);
	});

	it('should log an error when pending report fails to be saved', async () => {
		const pendingSaveError = new Error('Database Connection Error');
		pendingReportsServiceMock.createPendingReport.mockRejectedValueOnce(
			pendingSaveError,
		);
		await expect(processor.process(mockPayload)).rejects.toThrow(
			InternalServerErrorException,
		);
		expect(Logger.prototype.error).toHaveBeenCalledWith(
			expect.stringContaining(
				'Failed to save report as Pending for contribution:',
			),
			expect.any(String),
			pendingSaveError,
		);

		expect(Logger.prototype.error).toHaveBeenCalledWith(
			expect.stringContaining('Failed to process 1 contributions:'),
		);

		expect(submitReportsServiceMock.insertReport).toHaveBeenCalledTimes(2);
		expect(submitReportsServiceMock.insertReport).toHaveBeenNthCalledWith(2, {
			activity_term: 'generic_review_activity',
			curator_orcid: '0000-0002-2222-3333',
			entity_uri: 'https://github.com/org/repo/pull/1',
			resource_id: 'res_456',
			timestamp: new Date('2026-07-29T10:00:00.000Z'),
			league: 'default',
		});
	});
	it('should create pending report when orcid is unknown for the contribution contributor', async () => {
		await processor.process(mockPayload);
		expect(pendingReportsServiceMock.createPendingReport).toHaveBeenCalledTimes(
			1,
		);
		expect(pendingReportsServiceMock.createPendingReport).toHaveBeenCalledWith(
			expect.objectContaining({
				resource_id: 'res_456',
				entity_uri: 'https://github.com/org/repo/pull/1',
				activity_term: 'generic_review_activity',
				timestamp: new Date('2026-07-29T10:00:00.000Z'),
				contributor_identifier: 'reviewer2',
				contributor_identifier_type: ContributorIdentifierType.GITHUB,
			}),
		);
	});

	it('should handle payloads with no reviewers', async () => {
		const singlePayload: PRPayloadDto = {
			...mockPayload,
			context: {
				...mockPayload.context,
				reviewers: [],
			},
		};

		await processor.process(singlePayload);

		expect(submitReportsServiceMock.insertReport).toHaveBeenCalledTimes(1);
		expect(submitReportsServiceMock.insertReport).toHaveBeenCalledWith(
			expect.objectContaining({
				curator_orcid: '0000-0001-1111-2222',
				activity_term: 'bug_fixing_activity',
			}),
		);
	});
});
