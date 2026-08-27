/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { UserOrcidIdentifiedEvent } from 'src/auth/users/events/orcid-identified.event';
import { ContributorIdentifierType } from 'src/core/enums';
import { SubmitReportService } from 'src/submit-reports/services/submit-reports.service';
import { PendingReport } from './entities/pending-report.entity';
import { PendingReportsRepository } from './repository/pending-report.repository';
import { PendingReportsService } from './services/pending-reports.service';
import { ReconcilationService } from './services/reconciliation.service';

describe('PendingReports Module Integration', () => {
	let moduleFixture: TestingModule;
	let eventEmitter: EventEmitter2;
	let repositoryMock: {
		save: jest.Mock;
		findByContributorIdentifier: jest.Mock;
		archive: jest.Mock;
		markAsFailed: jest.Mock;
	};
	let submitServiceMock: {
		insertReport: jest.Mock;
	};

	const mockReport = new PendingReport({
		id: 'pending_report_99',
		resource_id: 'res_test',
		entity_uri: 'https://example.com/entity/99',
		activity_term: 'annotation',
		timestamp: new Date('2026-08-20T12:00:00.000Z'),
		contributor_identifier: 'john_doe',
		contributor_identifier_type: ContributorIdentifierType.GITHUB,
	});

	beforeEach(async () => {
		repositoryMock = {
			save: jest.fn().mockResolvedValue(undefined),
			findByContributorIdentifier: jest.fn().mockResolvedValue([mockReport]),
			archive: jest.fn().mockResolvedValue(undefined),
			markAsFailed: jest.fn().mockResolvedValue(undefined),
		};

		submitServiceMock = {
			insertReport: jest.fn().mockResolvedValue({ report: {} } as any),
		};

		moduleFixture = await Test.createTestingModule({
			imports: [EventEmitterModule.forRoot()],
			providers: [
				PendingReportsService,
				ReconcilationService,
				{
					provide: PendingReportsRepository,
					useValue: repositoryMock,
				},
				{
					provide: SubmitReportService,
					useValue: submitServiceMock,
				},
			],
		}).compile();

		await moduleFixture.init();

		eventEmitter = moduleFixture.get<EventEmitter2>(EventEmitter2);
	});

	afterEach(async () => {
		jest.clearAllMocks();
		if (moduleFixture) {
			await moduleFixture.close();
		}
	});

	it('should automatically trigger reconciliation flow when UserOrcidIdentifiedEvent is emitted', async () => {
		const eventPayload = UserOrcidIdentifiedEvent.fromGithub(
			'john_doe',
			'0000-0001-2345-6789',
		);

		await eventEmitter.emitAsync(
			UserOrcidIdentifiedEvent.eventName,
			eventPayload,
		);

		// ! release the thread for the async event listener to finish execution
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(repositoryMock.findByContributorIdentifier).toHaveBeenCalledWith(
			'john_doe',
			ContributorIdentifierType.GITHUB,
		);

		expect(submitServiceMock.insertReport).toHaveBeenCalledWith({
			activity_term: 'annotation',
			curator_orcid: '0000-0001-2345-6789',
			entity_uri: 'https://example.com/entity/99',
			resource_id: 'res_test',
			timestamp: mockReport.timestamp,
		});

		expect(repositoryMock.archive).toHaveBeenCalledWith('pending_report_99');
	});
});
