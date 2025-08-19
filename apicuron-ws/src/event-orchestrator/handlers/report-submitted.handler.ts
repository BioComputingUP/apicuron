import {
	Injectable,
	Logger,
	OnModuleDestroy,
	OnModuleInit,
} from '@nestjs/common';
import { IEventHandler } from '@nestjs/cqrs';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
	catchError,
	concatMap,
	Observable,
	of,
	Subject,
	takeUntil,
} from 'rxjs';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import {
	IReportSubmittedEventPayload,
	ReportSubmittedEvent,
} from '../../submit-reports/events/events';
import { SubmissionRunner } from '../aggregator-runners/bulk-submission.runner';
import { Aggregator } from '../interfaces/aggregator.interface';

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
		this.logger.debug('Destroying ReportSubmittedEventHandler');
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
					return of();
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
			try {
				await aggregator.applyReport(report, term, resource, user ?? undefined);
			} catch (error) {
				this.logger.error(
					`Error processing report in aggregator ${aggregator.constructor.name}: ${error.message}`,
					error.stack,
					error.name,
				);
				throw error;
			}
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
