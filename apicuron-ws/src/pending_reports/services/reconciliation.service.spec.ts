/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConflictException, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { ReconcilationService } from './reconciliation.service';
import { PendingReportsRepository } from '../repository/pending-report.repository';
import { SubmitReportService } from 'src/submit-reports/services/submit-reports.service';
import { PendingReport } from '../entities/pending-report.entity';
import { ContributorIdentifierType } from 'src/core/enums';
import { UserOrcidIdentifiedEvent } from 'src/auth/users/events/orcid-identified.event';

describe('ReconcilationService', () => {
	let service: ReconcilationService;
	let repositoryMock: {
		findByContributorIdentifier: jest.Mock;
		archive: jest.Mock;
		markAsFailed: jest.Mock;
	};
	let submitServiceMock: {
		insertReport: jest.Mock;
	};
	let eventEmitterMock: {
		emit: jest.Mock;
	};

	const mockReport1 = new PendingReport({
		id: 'report_1',
		resource_id: 'res_1',
		entity_uri: 'https://example.com/entity/1',
		activity_term: 'term_1',
		timestamp: new Date('2026-08-01T10:00:00.000Z'),
		contributor_identifier: 'github_user1',
		contributor_identifier_type: ContributorIdentifierType.GITHUB,
	});

	const mockReport2 = new PendingReport({
		id: 'report_2',
		resource_id: 'res_2',
		entity_uri: 'https://example.com/entity/2',
		activity_term: 'term_2',
		timestamp: new Date('2026-08-01T11:00:00.000Z'),
		contributor_identifier: 'github_user1',
		contributor_identifier_type: ContributorIdentifierType.GITHUB,
	});

	beforeEach(async () => {
		repositoryMock = {
			findByContributorIdentifier: jest
				.fn()
				.mockResolvedValue([mockReport1, mockReport2]),
			archive: jest.fn().mockResolvedValue(undefined),
			markAsFailed: jest.fn().mockResolvedValue(undefined),
		};

		submitServiceMock = {
			insertReport: jest.fn().mockResolvedValue({ report: {} } as any),
		};

		eventEmitterMock = {
			emit: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ReconcilationService,
				{
					provide: PendingReportsRepository,
					useValue: repositoryMock,
				},
				{
					provide: SubmitReportService,
					useValue: submitServiceMock,
				},
				{
					provide: EventEmitter2,
					useValue: eventEmitterMock,
				},
			],
		}).compile();

		service = module.get<ReconcilationService>(ReconcilationService);
		jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('reconcile', () => {
		it('should submit each pending report and archive them on success', async () => {
			const result = await service.reconcile(
				'github_user1',
				ContributorIdentifierType.GITHUB,
				'0000-0002-1825-0097',
			);

			expect(repositoryMock.findByContributorIdentifier).toHaveBeenCalledWith(
				'github_user1',
				ContributorIdentifierType.GITHUB,
			);

			expect(submitServiceMock.insertReport).toHaveBeenCalledTimes(2);
			expect(submitServiceMock.insertReport).toHaveBeenNthCalledWith(1, {
				activity_term: 'term_1',
				curator_orcid: '0000-0002-1825-0097',
				entity_uri: 'https://example.com/entity/1',
				resource_id: 'res_1',
				timestamp: mockReport1.timestamp,
			});

			expect(repositoryMock.archive).toHaveBeenCalledWith('report_1');
			expect(repositoryMock.archive).toHaveBeenCalledWith('report_2');

			expect(result).toEqual({
				submitted: 2,
				failed: [],
			});
		});

		it('should handle ConflictException from submitService by archiving the report as reconciled', async () => {
			submitServiceMock.insertReport
				.mockRejectedValueOnce(new ConflictException('Report already exists'))
				.mockResolvedValueOnce({ report: {} } as any);

			const result = await service.reconcile(
				'github_user1',
				ContributorIdentifierType.GITHUB,
				'0000-0002-1825-0097',
			);

			expect(repositoryMock.archive).toHaveBeenCalledWith('report_1');
			expect(repositoryMock.archive).toHaveBeenCalledWith('report_2');
			expect(result.submitted).toBe(2);
			expect(result.failed).toHaveLength(0);
		});

		it('should mark report as failed and record failure when submitService throws unexpected error', async () => {
			const genericError = new Error('Database connection failed');
			submitServiceMock.insertReport
				.mockRejectedValueOnce(genericError)
				.mockResolvedValueOnce({ report: {} } as any);

			const result = await service.reconcile(
				'github_user1',
				ContributorIdentifierType.GITHUB,
				'0000-0002-1825-0097',
			);

			expect(repositoryMock.markAsFailed).toHaveBeenCalledWith(
				'report_1',
				genericError,
			);
			expect(repositoryMock.archive).toHaveBeenCalledTimes(1);
			expect(repositoryMock.archive).toHaveBeenCalledWith('report_2');

			expect(result.submitted).toBe(1);
			expect(result.failed).toEqual([
				{ report: mockReport1, error: genericError },
			]);
		});

		it('should return zero count when no pending reports are found', async () => {
			repositoryMock.findByContributorIdentifier.mockResolvedValueOnce([]);

			const result = await service.reconcile(
				'unknown_user',
				ContributorIdentifierType.GITHUB,
				'0000-0002-1825-0097',
			);

			expect(submitServiceMock.insertReport).not.toHaveBeenCalled();
			expect(result).toEqual({
				submitted: 0,
				failed: [],
			});
		});
	});

	describe('handleUserOrcidIdentified', () => {
		it('should invoke reconcile with payload parameters', async () => {
			const eventPayload = UserOrcidIdentifiedEvent.fromGithub(
				'github_user1',
				'0000-0002-1825-0097',
			);
			const reconcileSpy = jest.spyOn(service, 'reconcile').mockResolvedValue({
				submitted: 1,
				failed: [],
			});

			await service.handleUserOrcidIdentified(eventPayload);

			expect(reconcileSpy).toHaveBeenCalledWith(
				'github_user1',
				ContributorIdentifierType.GITHUB,
				'0000-0002-1825-0097',
			);
		});

		it('should catch error and log it if reconcile throws unexpectedly', async () => {
			const eventPayload = UserOrcidIdentifiedEvent.fromGithub(
				'github_user1',
				'0000-0002-1825-0097',
			);
			const error = new Error('Fatal error during reconciliation');
			jest.spyOn(service, 'reconcile').mockRejectedValueOnce(error);

			await service.handleUserOrcidIdentified(eventPayload);

			expect(Logger.prototype.error).toHaveBeenCalledWith(error);
		});
	});
});
