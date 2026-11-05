/* eslint-disable @typescript-eslint/no-explicit-any */
import { BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { useContainer } from 'class-validator';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { Readable } from 'stream';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import { EntityUriValid } from '../../submit-reports/validators/entity-uri';
import { SubmitBulkTask } from './submit_bulk.task';

describe('SubmitBulkTask', () => {
	const ORCID = '0000-0002-0341-4888';
	const REPORT = {
		activity_term: 'region_first_generation',
		timestamp: '2016-08-11T09:59:17.000Z',
		curator_orcid: ORCID,
		entity_uri: 'https://identifiers.org/disprot:DP00034',
		resource_id: 'disprot',
	};
	const RESOURCE = {
		resource_id: 'disprot',
		resource_uri: 'https://registry.identifiers.org/registry/disprot',
		resource_url: 'https://disprot.org/',
		allowedUrlsPrefix: ['https://identifiers.org'],
	};

	let dir: string;
	let task: SubmitBulkTask;
	let reportModel: { deleteMany: jest.Mock };
	let notifications: { create_user_notification: jest.Mock };
	let submitReports: { checkReport: jest.Mock; insertReport: jest.Mock };
	let eventEmitter: { emitAsync: jest.Mock };

	const writeFile = (content: unknown) => {
		const file = join(dir, 'reports.json');
		writeFileSync(
			file,
			typeof content === 'string' ? content : JSON.stringify(content),
		);
		return file;
	};
	const run = (content: unknown, delete_existing: string[] = ['disprot']) =>
		task.run([], { file: writeFile(content), orcid_id: ORCID, delete_existing });
	const notificationBody = () =>
		notifications.create_user_notification.mock.calls[0][1] as string;

	beforeEach(async () => {
		dir = mkdtempSync(join(tmpdir(), 'submit-bulk-'));
		jest.spyOn(Logger.prototype, 'log').mockImplementation();
		jest.spyOn(Logger.prototype, 'error').mockImplementation();
		jest.spyOn(console, 'log').mockImplementation();

		const moduleRef = await Test.createTestingModule({
			providers: [
				EntityUriValid,
				{
					provide: PartnerResourcesService,
					useValue: { get_resource: jest.fn().mockResolvedValue(RESOURCE) },
				},
				{ provide: ConfigService, useValue: { get: () => 'local' } },
			],
		}).compile();
		useContainer(moduleRef, { fallbackOnErrors: true });

		reportModel = {
			deleteMany: jest.fn().mockResolvedValue({ deletedCount: 3 }),
		};
		notifications = {
			create_user_notification: jest.fn().mockResolvedValue(undefined),
		};
		submitReports = {
			checkReport: jest.fn().mockResolvedValue(undefined),
			insertReport: jest.fn().mockResolvedValue({}),
		};
		eventEmitter = { emitAsync: jest.fn().mockResolvedValue([]) };
		task = new SubmitBulkTask(
			reportModel as any,
			{
				findOne: jest.fn().mockResolvedValue({
					resources: [{ resource_id: 'disprot' }],
				}),
			} as any,
			notifications as any,
			eventEmitter as any,
			submitReports as any,
		);
	});

	afterEach(() => {
		jest.restoreAllMocks();
		rmSync(dir, { recursive: true, force: true });
	});

	describe('when deleting existing reports', () => {
		it('deletes only after checking the whole file, then inserts', async () => {
			await run({ reports: [REPORT] });

			expect(submitReports.checkReport).toHaveBeenCalledTimes(1);
			const [checkOrder] = submitReports.checkReport.mock.invocationCallOrder;
			const [deleteOrder] = reportModel.deleteMany.mock.invocationCallOrder;
			const [insertOrder] = submitReports.insertReport.mock.invocationCallOrder;
			expect(checkOrder).toBeLessThan(deleteOrder);
			expect(deleteOrder).toBeLessThan(insertOrder);
			expect(reportModel.deleteMany).toHaveBeenCalledWith({
				resource_id: 'disprot',
			});
		});

		it('deletes nothing when a report fails the DTO validation', async () => {
			await run({
				reports: [
					REPORT,
					{ ...REPORT, entity_uri: 'https://elsewhere.org/DP00034' },
				],
			});

			expect(reportModel.deleteMany).not.toHaveBeenCalled();
			expect(submitReports.insertReport).not.toHaveBeenCalled();
			expect(notificationBody()).toContain('No reports were deleted');
			expect(notificationBody()).toContain('reports.1: ');
			expect(notificationBody()).toContain(
				'entity_uri "https://elsewhere.org/DP00034" is not allowed for "disprot"',
			);
		});

		it('deletes nothing when a report fails the activity term check', async () => {
			submitReports.checkReport.mockRejectedValue(
				new BadRequestException('Activity (x) does not exist for resource disprot.'),
			);

			await run({ reports: [REPORT] });

			expect(reportModel.deleteMany).not.toHaveBeenCalled();
			expect(submitReports.insertReport).not.toHaveBeenCalled();
			expect(notificationBody()).toContain('reports.0: Activity (x) does not exist');
		});

		it('deletes nothing when the file is not valid JSON', async () => {
			await run('{"reports": [');

			expect(reportModel.deleteMany).not.toHaveBeenCalled();
			expect(notificationBody()).toContain('The file could not be processed');
		});

		it('deletes nothing when the file has no reports for a deleted resource', async () => {
			await run({ reports: [] });

			expect(reportModel.deleteMany).not.toHaveBeenCalled();
			expect(notificationBody()).toContain('contains no reports for disprot');
		});

		it('supports global fields when checking the file', async () => {
			const { resource_id, ...report } = REPORT;

			await run({ resource_id, reports: [report] });

			expect(reportModel.deleteMany).toHaveBeenCalled();
		});

		it('limits the number of problems listed in the notification', async () => {
			const invalid = { ...REPORT, entity_uri: 'https://elsewhere.org/1' };

			await run({ reports: Array(60).fill(invalid) });

			expect(notificationBody()).toContain('Found 60 problem(s)');
			expect(notificationBody()).toContain('...and 10 more');
		});
	});

	describe('when not deleting', () => {
		it('skips invalid reports and inserts the valid ones', async () => {
			await run(
				{
					reports: [
						REPORT,
						{ ...REPORT, entity_uri: 'https://elsewhere.org/DP00034' },
					],
				},
				[],
			);

			expect(reportModel.deleteMany).not.toHaveBeenCalled();
			expect(submitReports.checkReport).not.toHaveBeenCalled();
			expect(submitReports.insertReport).toHaveBeenCalledTimes(1);
		});

		it('does not insert reports for a resource the user does not manage', async () => {
			await run({ reports: [{ ...REPORT, resource_id: 'another_resource' }] }, []);

			expect(submitReports.insertReport).not.toHaveBeenCalled();
			expect(notificationBody()).toContain(
				'does not have permission to submit to the resource another_resource',
			);
		});
	});

	describe('when inserting reports', () => {
		it('waits for every insert before notifying and updating the statistics', async () => {
			submitReports.insertReport.mockImplementation(
				() => new Promise((resolve) => setTimeout(() => resolve({}), 20)),
			);

			await run({ reports: [REPORT, REPORT, REPORT] }, []);

			expect(notificationBody()).toContain('Successfully submitted 3/3');
			expect(eventEmitter.emitAsync).toHaveBeenCalledTimes(1);
			expect(eventEmitter.emitAsync.mock.calls[0][1].resource_ids).toEqual([
				'disprot',
			]);
			const [insertOrder] = submitReports.insertReport.mock.invocationCallOrder;
			const [emitOrder] = eventEmitter.emitAsync.mock.invocationCallOrder;
			expect(insertOrder).toBeLessThan(emitOrder);
		});

		it('counts the failed inserts and does not update the statistics when none succeeded', async () => {
			submitReports.insertReport.mockRejectedValue(new Error('duplicate key'));

			await run({ reports: [REPORT, REPORT] }, []);

			expect(notificationBody()).toContain('Submission failed!');
			expect(notificationBody()).toContain('Failed to submit 2');
			expect(notificationBody()).toContain('InsertionError: duplicate key');
			expect(eventEmitter.emitAsync).not.toHaveBeenCalled();
		});

		it('keeps the reports read before a stream error and notifies the failure', async () => {
			jest.spyOn(task as any, 'build_report_stream').mockReturnValue(
				Readable.from(
					(async function* () {
						yield { report: REPORT, errors: [] };
						throw new Error('Unexpected end of file');
					})(),
				),
			);

			await run({ reports: [REPORT] }, []);

			const [title, body] = notifications.create_user_notification.mock.calls[0];
			expect(title).toBe('Submission Failed');
			expect(body).toContain('could not be read completely: Unexpected end of file');
			expect(body).toContain('Successfully submitted 1/1');
			expect(eventEmitter.emitAsync).toHaveBeenCalledTimes(1);
		});
	});
});
