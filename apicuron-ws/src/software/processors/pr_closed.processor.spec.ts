import { Test, TestingModule } from '@nestjs/testing';
import { PrContributionProcessor } from './pr_closed.processor';
import { GithubOrcidResolver } from '../helpers/github-orcid.resolver';
import { SubmitReportService } from 'src/submit-reports/services/submit-reports.service';
import { PRPayloadDto } from '../dto/pr_payload.dto';
import { Logger } from '@nestjs/common';

describe('PrContributionProcessor', () => {
	let processor: PrContributionProcessor;
	let orcidResolverMock: { resolve: jest.Mock };
	let submitReportsServiceMock: { insertReport: jest.Mock };

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
			reviewers: ['reviewer_user'],
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

		expect(orcidResolverMock.resolve).toHaveBeenCalledTimes(2);
		expect(orcidResolverMock.resolve).toHaveBeenCalledWith('author_user');
		expect(orcidResolverMock.resolve).toHaveBeenCalledWith('reviewer_user');

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

	it('should log an error and continue loop when insertReport fails for a contribution', async () => {
		const insertError = new Error('Database insertion failed');
		submitReportsServiceMock.insertReport
			.mockRejectedValueOnce(insertError)
			.mockResolvedValueOnce({ report: {} as unknown });

		await processor.process(mockPayload);

		expect(Logger.prototype.error).toHaveBeenCalledWith(
			expect.stringContaining(
				'Failed to submit report for github_login author_user',
			),
			expect.any(String),
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
