import {
	ConflictException,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PendingReportsService } from './pending-reports.service';
import { PendingReportsRepository } from '../repository/pending-report.repository';
import { ContributorIdentifierType } from 'src/core/enums';
import { PendingReport } from '../entities/pending-report.entity';

describe('PendingReportsService', () => {
	let service: PendingReportsService;
	let repositoryMock: {
		save: jest.Mock;
		findByContributorIdentifier: jest.Mock;
		findByResourceId: jest.Mock;
	};

	const mockPendingReport: PendingReport = new PendingReport({
		id: 'report_123',
		resource_id: 'resource_1',
		entity_uri: 'https://example.com/entity/1',
		activity_term: 'curation_activity',
		timestamp: new Date('2026-08-01T10:00:00.000Z'),
		contributor_identifier: 'user123',
		contributor_identifier_type: ContributorIdentifierType.GITHUB,
	});

	beforeEach(async () => {
		repositoryMock = {
			save: jest.fn().mockResolvedValue(undefined),
			findByContributorIdentifier: jest
				.fn()
				.mockResolvedValue([mockPendingReport]),
			findByResourceId: jest.fn().mockResolvedValue([mockPendingReport]),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PendingReportsService,
				{
					provide: PendingReportsRepository,
					useValue: repositoryMock,
				},
			],
		}).compile();

		service = module.get<PendingReportsService>(PendingReportsService);
		jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('createPendingReport', () => {
		it('should call repository.save with correct payload', async () => {
			await service.createPendingReport(mockPendingReport);

			expect(repositoryMock.save).toHaveBeenCalledTimes(1);
			expect(repositoryMock.save).toHaveBeenCalledWith({
				resource_id: mockPendingReport.resource_id,
				entity_uri: mockPendingReport.entity_uri,
				activity_term: mockPendingReport.activity_term,
				timestamp: mockPendingReport.timestamp,
				contributor_identifier: mockPendingReport.contributor_identifier,
				contributor_identifier_type:
					mockPendingReport.contributor_identifier_type,
			});
		});

		it('should rethrow ConflictException when pending report already exists', async () => {
			repositoryMock.save.mockRejectedValueOnce(
				new ConflictException('Pending report already exists'),
			);

			await expect(
				service.createPendingReport(mockPendingReport),
			).rejects.toThrow(ConflictException);
		});

		it('should log error and throw InternalServerErrorException for unexpected repository errors', async () => {
			const dbError = new Error('Database connection failed');
			repositoryMock.save.mockRejectedValueOnce(dbError);

			await expect(
				service.createPendingReport(mockPendingReport),
			).rejects.toThrow(InternalServerErrorException);

			expect(Logger.prototype.error).toHaveBeenCalledWith(dbError);
		});
	});

	describe('findPendingReportsForContributor', () => {
		it('should delegate to repository.findByContributorIdentifier', async () => {
			const result = await service.findPendingReportsForContributor(
				'user123',
				ContributorIdentifierType.GITHUB,
			);

			expect(repositoryMock.findByContributorIdentifier).toHaveBeenCalledWith(
				'user123',
				ContributorIdentifierType.GITHUB,
			);
			expect(result).toEqual([mockPendingReport]);
		});
	});

	describe('findPendingReportsForResource', () => {
		it('should delegate to repository.findByResourceId', async () => {
			const result = await service.findPendingReportsForResource('resource_1');

			expect(repositoryMock.findByResourceId).toHaveBeenCalledWith(
				'resource_1',
			);
			expect(result).toEqual([mockPendingReport]);
		});
	});
});
