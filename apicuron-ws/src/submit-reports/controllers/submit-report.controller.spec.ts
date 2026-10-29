/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	ConflictException,
	ExecutionContext,
	INestApplication,
	Logger,
	ValidationPipe,
	VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { useContainer } from 'class-validator';
import * as request from 'supertest';
import { SubmitBulkTask } from 'src/scheduler/tasks/submit_bulk.task';
import { HasAResourceGuard } from '../../auth/guards/belongs-to-resource.guard';
import { LocalAuthGuard } from '../../auth/guards/local-auth.guard';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import { SubmitReportsDto } from '../dto/submit-report.dto';
import { SubmitReportService } from '../services/submit-reports.service';
import { EntityUriValid } from '../validators/entity-uri';
import { SubmitReportsController } from './submit-report.controller';

describe('SubmitReportsController POST /reports', () => {
	const ORCID = '0000-0002-1825-0097';
	const RESOURCE = {
		resource_id: 'disprot',
		resource_uri: 'https://registry.identifiers.org/registry/disprot',
		resource_url: 'https://disprot.org/',
		allowedUrlsPrefix: ['https://identifiers.org'],
	};
	const REPORT = {
		activity_term: 'region_first_generation',
		timestamp: '2016-08-11T09:59:17.000Z',
		curator_orcid: ORCID,
		entity_uri: 'https://identifiers.org/disprot:DP00034',
	};

	let app: INestApplication;
	let currentUser: { orcid_id: string; resources: { resource_id: string }[] };
	let reportServiceMock: { insertReports: jest.Mock };
	let resourcesMock: { get_resource: jest.Mock; exists: jest.Mock };
	let callback: jest.Mock;
	let warnSpy: jest.SpyInstance;

	const post = (body: unknown) =>
		request(app.getHttpServer())
			.post('/reports')
			.set('version', '2')
			.send(body as object);

	beforeEach(async () => {
		currentUser = { orcid_id: ORCID, resources: [{ resource_id: 'disprot' }] };
		callback = jest.fn().mockResolvedValue(undefined);
		reportServiceMock = {
			insertReports: jest
				.fn()
				.mockImplementation(async (submission: SubmitReportsDto) => ({
					insertedCount: submission.reports.length,
					deletedReports: {},
					callback,
				})),
		};
		resourcesMock = {
			get_resource: jest.fn().mockResolvedValue(RESOURCE),
			exists: jest.fn().mockResolvedValue(true),
		};
		warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
		jest.spyOn(Logger.prototype, 'verbose').mockImplementation();

		const moduleFixture = await Test.createTestingModule({
			controllers: [SubmitReportsController],
			providers: [
				EntityUriValid,
				{ provide: SubmitReportService, useValue: reportServiceMock },
				{ provide: PartnerResourcesService, useValue: resourcesMock },
				{ provide: SubmitBulkTask, useValue: {} },
				{ provide: ConfigService, useValue: { get: () => 'local' } },
			],
		})
			.overrideGuard(LocalAuthGuard)
			.useValue({
				canActivate: (context: ExecutionContext) => {
					context.switchToHttp().getRequest().user = currentUser;
					return true;
				},
			})
			.overrideGuard(HasAResourceGuard)
			.useValue({ canActivate: () => true })
			.compile();

		app = moduleFixture.createNestApplication();
		// same setup as main.ts
		useContainer(app, { fallbackOnErrors: true });
		app.useGlobalPipes(
			new ValidationPipe({
				transformOptions: {
					enableImplicitConversion: true,
				},
				stopAtFirstError: true,
				transform: true,
				forbidUnknownValues: false,
				skipMissingProperties: false,
				whitelist: true,
			}),
		);
		app.enableVersioning({ type: VersioningType.HEADER, header: 'version' });
		await app.init();
	});

	afterEach(async () => {
		jest.restoreAllMocks();
		await app.close();
	});

	it('submits reports using the global resource_id', async () => {
		const response = await post({
			resource_id: 'disprot',
			reports: [REPORT, REPORT],
		}).expect(201);

		expect(response.body).toEqual({
			message: 'Successfully submitted 2 of 2 report(s)',
			submittedCount: 2,
			insertedCount: 2,
			resource_ids: ['disprot'],
			deletedReports: {},
		});
		const [submission] = reportServiceMock.insertReports.mock
			.calls[0] as SubmitReportsDto[];
		expect(submission.reports.map((r) => r.resource_id)).toEqual([
			'disprot',
			'disprot',
		]);
		expect(callback).toHaveBeenCalled();
	});

	it('rejects reports without any resource_id with a 400', async () => {
		const response = await post({ reports: [REPORT] }).expect(400);

		expect(response.body.message).toEqual([
			'reports.0.resource_id should not be empty',
		]);
		expect(reportServiceMock.insertReports).not.toHaveBeenCalled();
		expect(warnSpy).toHaveBeenCalledWith(
			`POST /reports by ${ORCID} failed with 400: reports.0.resource_id should not be empty`,
		);
	});

	it('forbids submitting to a resource the user does not manage', async () => {
		resourcesMock.get_resource.mockResolvedValue({
			...RESOURCE,
			resource_id: 'another_resource',
		});

		const response = await post({
			resource_id: 'disprot',
			reports: [REPORT, { ...REPORT, resource_id: 'another_resource' }],
		}).expect(403);

		expect(response.body.message).toContain('(another_resource)');
		expect(reportServiceMock.insertReports).not.toHaveBeenCalled();
		expect(warnSpy).toHaveBeenCalledWith(
			expect.stringContaining(`POST /reports by ${ORCID} failed with 403`),
		);
	});

	it('forbids deleting the reports of a resource the user does not manage', async () => {
		const response = await post({
			resource_id: 'disprot',
			reports: [REPORT],
			delete_all: ['another_resource'],
		}).expect(403);

		expect(response.body.message).toContain('(another_resource)');
		expect(reportServiceMock.insertReports).not.toHaveBeenCalled();
	});

	it('responds with the conflict raised on duplicate reports', async () => {
		reportServiceMock.insertReports.mockRejectedValue(
			new ConflictException({
				statusCode: 409,
				error: 'Conflict',
				message: 'Duplicate report at index 0',
				insertedCount: 0,
				deletedReports: {},
			}),
		);

		const response = await post({
			resource_id: 'disprot',
			reports: [REPORT],
		}).expect(409);

		expect(response.body).toMatchObject({
			message: 'Duplicate report at index 0',
			insertedCount: 0,
		});
		expect(warnSpy).toHaveBeenCalledWith(
			`POST /reports by ${ORCID} failed with 409: Duplicate report at index 0`,
		);
	});
});
