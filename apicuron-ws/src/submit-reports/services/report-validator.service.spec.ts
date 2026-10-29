/* eslint-disable @typescript-eslint/no-explicit-any */
import { BadRequestException } from '@nestjs/common';
import { SubmitReportDto } from '../dto/submit-report.dto';
import { ReportValidatorService } from './report-validator.service';

describe('ReportValidatorService', () => {
	const league = (name: string) => ({
		name,
		defaultMembers: [],
		toObject: () => ({ name }),
	});
	const RESOURCE = {
		resource_id: 'disprot',
		defaultLeague: 'default',
		leagues: [league('default')],
	};

	const report = (fields: Partial<SubmitReportDto> = {}): SubmitReportDto =>
		({
			resource_id: 'disprot',
			activity_term: 'region_first_generation',
			curator_orcid: '0000-0002-1825-0097',
			entity_uri: 'https://identifiers.org/disprot:DP00034',
			timestamp: new Date('2016-08-11T09:59:17.000Z'),
			...fields,
		} as SubmitReportDto);

	let service: ReportValidatorService;
	let resourcesMock: { get_resources: jest.Mock };
	let usersMock: { getUsers: jest.Mock };
	let termsMock: { find: jest.Mock };

	const responseMessage = async (promise: Promise<unknown>) => {
		try {
			await promise;
		} catch (err) {
			expect(err).toBeInstanceOf(BadRequestException);
			return (err as BadRequestException).getResponse()['message'];
		}
		throw new Error('Expected the validation to be rejected');
	};

	beforeEach(() => {
		resourcesMock = { get_resources: jest.fn().mockResolvedValue([RESOURCE]) };
		usersMock = { getUsers: jest.fn().mockResolvedValue([]) };
		termsMock = { find: jest.fn().mockResolvedValue([]) };
		service = new ReportValidatorService(
			resourcesMock as any,
			usersMock as any,
			termsMock as any,
			{} as any,
		);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('validateReports', () => {
		it('rejects with the list of unknown resources', async () => {
			await expect(
				responseMessage(
					service.validateReports([
						report(),
						report({ resource_id: 'unknown_a' }),
						report({ resource_id: 'unknown_b' }),
						report({ resource_id: 'unknown_a' }),
					]),
				),
			).resolves.toBe('Resource(s) not found: unknown_a, unknown_b');
		});

		it('sends the index of the report with an unknown league in the response', async () => {
			await expect(
				responseMessage(
					service.validateReports([report(), report({ league: 'unknown' })]),
				),
			).resolves.toBe(
				'reports.1: League unknown does not exist for resource disprot',
			);
		});

		it('sends the index of the report failing validation in the response', async () => {
			jest
				.spyOn(service, 'validateReport')
				.mockResolvedValueOnce({} as any)
				.mockRejectedValueOnce(
					new BadRequestException(
						'Activity (unknown) does not exist for resource disprot.',
					),
				);

			await expect(
				responseMessage(service.validateReports([report(), report()])),
			).resolves.toBe(
				'reports.1: Activity (unknown) does not exist for resource disprot.',
			);
		});

		it('propagates unexpected errors instead of dropping the report', async () => {
			jest
				.spyOn(service, 'validateReport')
				.mockRejectedValue(new Error('connection lost'));

			await expect(service.validateReports([report()])).rejects.toThrow(
				'connection lost',
			);
		});

		it('returns a result for every valid report', async () => {
			jest
				.spyOn(service, 'validateReport')
				.mockImplementation(async (r) => ({ report: r } as any));
			const reports = [report(), report({ activity_term: 'other' })];

			const results = await service.validateReports(reports);

			expect(results.map((r) => r.report)).toEqual(reports);
			expect(reports.every((r) => r.league === 'default')).toBe(true);
		});
	});
});
