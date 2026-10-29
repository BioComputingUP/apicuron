/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	InternalServerErrorException,
} from '@nestjs/common';
import { MongoBulkWriteError } from 'mongodb';
import { SubmitReportsDto } from '../dto/submit-report.dto';
import { SubmitReportService } from './submit-reports.service';

describe('SubmitReportService', () => {
	const submission = (fields: Partial<SubmitReportsDto> = {}) =>
		({
			reports: [
				{ resource_id: 'disprot' },
				{ resource_id: 'disprot' },
				{ resource_id: 'disprot' },
			],
			...fields,
		} as SubmitReportsDto);

	let service: SubmitReportService;
	let reportModelMock: { insertMany: jest.Mock; deleteMany: jest.Mock };
	let eventEmitterMock: { emitAsync: jest.Mock };
	let resourcesMock: { get_resource: jest.Mock };
	let validatorMock: { validateReports: jest.Mock };

	const duplicateError = (insertedCount: number, index: number) =>
		new MongoBulkWriteError(
			{
				message: 'E11000 duplicate key error collection: reports',
				code: 11000,
				writeErrors: [{ index, code: 11000 }],
			} as any,
			{ insertedCount } as any,
		);

	beforeEach(() => {
		reportModelMock = {
			insertMany: jest
				.fn()
				.mockResolvedValue({ insertedCount: 3, acknowledged: true }),
			deleteMany: jest
				.fn()
				.mockResolvedValue({ deletedCount: 5, acknowledged: true }),
		};
		eventEmitterMock = { emitAsync: jest.fn().mockResolvedValue([]) };
		resourcesMock = {
			get_resource: jest.fn().mockResolvedValue({ resource_id: 'disprot' }),
		};
		validatorMock = {
			validateReports: jest
				.fn()
				.mockImplementation(async (reports: unknown[]) =>
					reports.map((report) => ({ report })),
				),
		};
		service = new SubmitReportService(
			reportModelMock as any,
			eventEmitterMock as any,
			resourcesMock as any,
			validatorMock as any,
		);
	});

	describe('insertReports', () => {
		it('returns the inserted and deleted counts', async () => {
			const result = await service.insertReports(
				submission({ delete_all: ['disprot'] }),
			);

			expect(result.insertedCount).toBe(3);
			expect(result.deletedReports).toEqual({
				disprot: { deletedCount: 5, acknowledged: true },
			});
		});

		it('turns a duplicate report into a conflict naming its index', async () => {
			reportModelMock.insertMany.mockRejectedValue(duplicateError(2, 2));

			const error = await service
				.insertReports(submission({ delete_all: ['disprot'] }))
				.then(
					() => null,
					(err: ConflictException) => err,
				);

			expect(error).toBeInstanceOf(ConflictException);
			expect(error?.getResponse()).toEqual({
				statusCode: 409,
				error: 'Conflict',
				message:
					'Duplicate report at index 2: a report from the same curator to the same resource with the same timestamp already exists. 2 report(s) preceding it were inserted',
				insertedCount: 2,
				deletedReports: { disprot: { deletedCount: 5, acknowledged: true } },
			});
		});

		it.each([
			new BadRequestException('reports.0: League unknown does not exist'),
			new ForbiddenException('forbidden'),
		])('propagates the http exception %p', async (exception) => {
			validatorMock.validateReports.mockRejectedValue(exception);

			await expect(service.insertReports(submission())).rejects.toBe(exception);
		});

		it('hides unexpected errors behind an internal server error', async () => {
			reportModelMock.insertMany.mockRejectedValue(
				new Error('connection lost'),
			);

			await expect(service.insertReports(submission())).rejects.toBeInstanceOf(
				InternalServerErrorException,
			);
		});

		it('does not delete anything when validation fails', async () => {
			validatorMock.validateReports.mockRejectedValue(
				new BadRequestException('Resource(s) not found: unknown'),
			);

			await expect(
				service.insertReports(submission({ delete_all: ['disprot'] })),
			).rejects.toBeInstanceOf(BadRequestException);
			expect(reportModelMock.deleteMany).not.toHaveBeenCalled();
		});
	});
});
