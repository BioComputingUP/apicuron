/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ConflictException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoServerError } from 'mongodb';
import { ContributorIdentifierType, PendingReportStatus } from 'src/core/enums';
import { PendingReportDB } from 'src/core/schemas/pending reports/pending-report.schema';
import { PendingReport } from '../entities/pending-report.entity';
import { PendingReportsRepository } from './pending-report.repository';

describe('PendingReportsRepository', () => {
	let repository: PendingReportsRepository;
	let modelMock: {
		create: jest.Mock;
		find: jest.Mock;
		findByIdAndUpdate: jest.Mock;
	};

	const mockDoc = {
		_id: '507f1f77bcf86cd799439011',
		resource_id: 'res_1',
		entity_uri: 'https://example.com/entity/1',
		activity_term: 'term_1',
		timestamp: new Date('2026-08-01T10:00:00.000Z'),
		contributor_identifier: 'user_1',
		contributor_identifier_type: ContributorIdentifierType.GITHUB,
		status: PendingReportStatus.PENDING,
		reconciliation_attempt_count: 0,
		created_at: new Date(),
		updated_at: new Date(),
	};

	beforeEach(async () => {
		modelMock = {
			create: jest.fn().mockResolvedValue(mockDoc as any),
			find: jest.fn().mockReturnValue({
				exec: jest.fn().mockResolvedValue([mockDoc]),
			} as any),
			findByIdAndUpdate: jest.fn().mockResolvedValue(mockDoc as any),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PendingReportsRepository,
				{
					provide: getModelToken(PendingReportDB.name),
					useValue: modelMock,
				},
			],
		}).compile();

		repository = module.get<PendingReportsRepository>(PendingReportsRepository);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('save', () => {
		it('should create document in model with provided report fields', async () => {
			const reportData = {
				resource_id: 'res_1',
				entity_uri: 'https://example.com/entity/1',
				activity_term: 'term_1',
				timestamp: new Date('2026-08-01T10:00:00.000Z'),
				contributor_identifier: 'user_1',
				contributor_identifier_type: ContributorIdentifierType.GITHUB,
			};

			await repository.save(reportData);

			expect(modelMock.create).toHaveBeenCalledWith(reportData);
		});

		it('should throw ConflictException if MongoServerError with code 11000 is encountered', async () => {
			const duplicateError = new MongoServerError({
				message: 'E11000 duplicate key error',
				code: 11000,
			});
			modelMock.create.mockRejectedValueOnce(duplicateError);

			await expect(
				repository.save({
					resource_id: 'res_1',
					entity_uri: 'https://example.com/entity/1',
					activity_term: 'term_1',
					timestamp: new Date(),
					contributor_identifier: 'user_1',
					contributor_identifier_type: ContributorIdentifierType.GITHUB,
				}),
			).rejects.toThrow(ConflictException);
		});

		it('should rethrow generic errors during save', async () => {
			const genericError = new Error('Database down');
			modelMock.create.mockRejectedValueOnce(genericError);

			await expect(
				repository.save({
					resource_id: 'res_1',
					entity_uri: 'https://example.com/entity/1',
					activity_term: 'term_1',
					timestamp: new Date(),
					contributor_identifier: 'user_1',
					contributor_identifier_type: ContributorIdentifierType.GITHUB,
				}),
			).rejects.toThrow(genericError);
		});
	});

	describe('findAll', () => {
		it('should query find with status filter and return mapped entities', async () => {
			const results = await repository.findAll(PendingReportStatus.PENDING);

			expect(modelMock.find).toHaveBeenCalledWith({
				status: PendingReportStatus.PENDING,
			});
			expect(results).toEqual([
				PendingReport.fromMongooseDocument(mockDoc as any),
			]);
		});
	});

	describe('findByResourceId', () => {
		it('should query find by resource_id and status', async () => {
			const results = await repository.findByResourceId(
				'res_1',
				PendingReportStatus.PENDING,
			);

			expect(modelMock.find).toHaveBeenCalledWith({
				resource_id: 'res_1',
				status: PendingReportStatus.PENDING,
			});
			expect(results).toEqual([
				PendingReport.fromMongooseDocument(mockDoc as any),
			]);
		});
	});

	describe('findByContributorIdentifier', () => {
		it('should query by contributor identifier and default status PENDING', async () => {
			const results = await repository.findByContributorIdentifier(
				'user_1',
				ContributorIdentifierType.GITHUB,
			);

			expect(modelMock.find).toHaveBeenCalledWith({
				contributor_identifier: 'user_1',
				contributor_identifier_type: ContributorIdentifierType.GITHUB,
				status: PendingReportStatus.PENDING,
			});
			expect(results).toEqual([
				PendingReport.fromMongooseDocument(mockDoc as any),
			]);
		});
	});

	describe('archive', () => {
		it('should update status to SUBMITTED and set reconciled_at timestamp', async () => {
			await repository.archive('507f1f77bcf86cd799439011');

			expect(modelMock.findByIdAndUpdate).toHaveBeenCalledWith(
				'507f1f77bcf86cd799439011',
				{
					status: PendingReportStatus.SUBMITTED,
					reconciled_at: expect.any(Date),
				},
			);
		});
	});

	describe('markAsFailed', () => {
		it('should update status to FAILED, serialize error string, and increment reconciliation_attempt_count', async () => {
			const testError = new Error('Connection timeout');

			await repository.markAsFailed('507f1f77bcf86cd799439011', testError);

			expect(modelMock.findByIdAndUpdate).toHaveBeenCalledWith(
				'507f1f77bcf86cd799439011',
				{
					status: PendingReportStatus.FAILED,
					error: expect.stringContaining('Connection timeout'),
					$inc: { reconciliation_attempt_count: 1 },
				},
			);
		});
	});
});
