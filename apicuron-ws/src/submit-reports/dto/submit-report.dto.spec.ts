/* eslint-disable @typescript-eslint/no-explicit-any */
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { EntityUriValid } from '../validators/entity-uri';
import {
	mergeGlobalFields,
	SubmitReportDto,
	SubmitReportsDto,
} from './submit-report.dto';

describe('SubmitReportsDto global fields', () => {
	const RESOURCE = {
		resource_id: 'disprot',
		resource_uri: 'https://registry.identifiers.org/registry/disprot',
		resource_url: 'https://disprot.org/',
		allowedUrlsPrefix: ['https://identifiers.org'],
	};
	const REPORT = {
		activity_term: 'region_first_generation',
		timestamp: '2016-08-11T09:59:17.000Z',
		curator_orcid: '0000-0002-1825-0097',
		entity_uri: 'https://identifiers.org/disprot:DP00034',
	};

	let resourcesMock: { get_resource: jest.Mock };

	// same options as the global ValidationPipe in main.ts
	const pipe = new ValidationPipe({
		transformOptions: {
			enableImplicitConversion: true,
		},
		stopAtFirstError: true,
		transform: true,
		forbidUnknownValues: false,
		skipMissingProperties: false,
		whitelist: true,
	});

	const validateBody = (body: unknown): Promise<SubmitReportsDto> =>
		pipe.transform(body, { type: 'body', metatype: SubmitReportsDto });

	const validationMessages = async (body: unknown): Promise<string[]> => {
		try {
			await validateBody(body);
		} catch (err) {
			expect(err).toBeInstanceOf(BadRequestException);
			return (err as BadRequestException).getResponse()['message'];
		}
		throw new Error('Expected the submission to be rejected');
	};

	beforeAll(() => {
		resourcesMock = { get_resource: jest.fn() };
		const entityUriValid = new EntityUriValid(
			resourcesMock as any,
			{ get: jest.fn() } as any,
		);
		useContainer(
			{
				get: (cls: any) =>
					cls === EntityUriValid ? entityUriValid : new cls(),
			},
			{ fallback: true },
		);
	});

	beforeEach(() => {
		resourcesMock.get_resource.mockResolvedValue(RESOURCE);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('mergeGlobalFields', () => {
		it('adds the global fields to every report', () => {
			const reports = mergeGlobalFields({
				resource_id: 'disprot',
				reports: [REPORT, REPORT],
			}) as SubmitReportDto[];

			expect(reports).toHaveLength(2);
			for (const report of reports) {
				expect(report).toBeInstanceOf(SubmitReportDto);
				expect(report.resource_id).toBe('disprot');
			}
		});

		it('lets a report override a global field', () => {
			const [first, second] = mergeGlobalFields({
				resource_id: 'disprot',
				reports: [REPORT, { ...REPORT, resource_id: 'another_resource' }],
			}) as SubmitReportDto[];

			expect(first.resource_id).toBe('disprot');
			expect(second.resource_id).toBe('another_resource');
		});

		it('ignores root fields that are not report fields', () => {
			const [report] = mergeGlobalFields({
				delete_all: ['disprot'],
				unknown_field: 'value',
				reports: [REPORT],
			}) as Record<string, unknown>[];

			expect(report.delete_all).toBeUndefined();
			expect(report.unknown_field).toBeUndefined();
		});


		it('returns reports as is when it is not an array', () => {
			expect(mergeGlobalFields({ reports: 'not-an-array' })).toBe(
				'not-an-array',
			);
			expect(mergeGlobalFields(undefined)).toBeUndefined();
		});
	});

	describe('validation', () => {
		it('accepts reports that get their resource_id from the global field', async () => {
			const submission = await validateBody({
				resource_id: 'disprot',
				reports: [REPORT],
			});

			expect(submission.reports[0]).toBeInstanceOf(SubmitReportDto);
			expect(submission.reports[0].resource_id).toBe('disprot');
			expect(submission.reports[0].timestamp).toEqual(
				new Date(REPORT.timestamp),
			);
			expect(resourcesMock.get_resource).toHaveBeenCalledWith('disprot');
		});

		it('validates the entity_uri against the merged resource', async () => {
			await expect(
				validationMessages({
					resource_id: 'disprot',
					reports: [{ ...REPORT, entity_uri: 'https://example.com/DP00034' }],
				}),
			).resolves.toEqual([
				'reports.0."entity_uri" must share the same host as the resource "disprot"',
			]);
		});

		it('reports a missing resource_id instead of looking up an undefined resource', async () => {
			await expect(validationMessages({ reports: [REPORT] })).resolves.toEqual([
				'reports.0.resource_id should not be empty',
			]);
			expect(resourcesMock.get_resource).not.toHaveBeenCalled();
		});

		it('rejects a submission without a reports array', async () => {
			const messages = await validationMessages({ resource_id: 'disprot' });

			expect(messages).toEqual([expect.stringContaining('reports')]);
		});
	});
});
