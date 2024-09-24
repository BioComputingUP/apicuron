import {
	Injectable,
	Logger,
	OnModuleDestroy,
	OnModuleInit,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
	IReportSubmittedEventPayload,
	ReportSubmittedEvent,
} from '../../submit-reports/events/events';
import { InjectModel } from '@nestjs/mongoose';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { Model } from 'mongoose';
import { IEventHandler } from '@nestjs/cqrs';
import {
	EMPTY,
	Observable,
	Subject,
	catchError,
	concatMap,
	takeUntil,
} from 'rxjs';
import { BaseAggregatorRunner } from '../aggregator-runners/base.runner';
import { Aggregator } from '../interfaces/aggregator.interface';
import { SubmissionRunner } from '../aggregator-runners/bulk-submission.runner';

@Injectable()
export class ReportSubmittedEventHandler
	implements IEventHandler, OnModuleInit, OnModuleDestroy
{
	constructor(
		protected aggregatorRunner: SubmissionRunner,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
	) {}
	logger = new Logger(ReportSubmittedEventHandler.name);

	onModuleDestroy() {
		this.destroy$.next();
	}

	destroy$ = new Subject<void>();
	eventSubject = new Subject<{
		payload: IReportSubmittedEventPayload;
		callback: (...args: any[]) => any;
	}>();

	onModuleInit() {
		this.eventSubject
			.pipe(
				concatMap(({ payload, callback }): Observable<any> => {
					return new Observable((subscriber) => {
						this.processReport(payload)
							.catch((err) => {
								this.logger.error(
									`Error Processing report for resource "${payload.report.resource_id}" from user ${payload.report.curator_orcid}:${payload?.user?.displayedName}`,
									err,
								);
								subscriber.error(err);
							})
							.then(callback)
							.then((v) => {
								subscriber.next(v);
								subscriber.complete();
							});
					});
				}),
				catchError((err) => {
					this.logger.error('Error processing report', err);
					return EMPTY;
				}),
				takeUntil(this.destroy$),
			)
			.subscribe();
	}

	/**
	 * Processes a submitted report.
	 *
	 * @param payload - The report document to be processed.
	 * @returns A Promise that resolves to the result of applying the report to the aggregators.
	 */
	private async processReport(payload: IReportSubmittedEventPayload) {
		return await this.aggregatorRunner.run(async (aggregator: Aggregator) => {
			this.logger.debug(
				`Applying report for resource "${payload.report.resource_id}" to aggregator "${aggregator.constructor.name}"`,
			);
			const { report, term, resource, user } = payload;
			return await aggregator.applyReport(report, term, resource, user);
		});
	}

	/**
	 * A method that submits the event payload to the aggregator
	 * @param payload The payload of the event
	 * @returns A promise that resolves when the event has been processed
	 */
	private async submitEventPayload(payload: IReportSubmittedEventPayload) {
		return await new Promise((resolve) => {
			this.eventSubject.next({ payload, callback: resolve });
		});
	}

	@OnEvent(ReportSubmittedEvent, { async: true, promisify: true })
	async handle(payload: IReportSubmittedEventPayload) {
		return await this.submitEventPayload(payload);
	}
}
