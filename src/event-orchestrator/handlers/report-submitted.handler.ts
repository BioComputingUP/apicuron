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
import { Observable, Subject, concatMap, takeUntil } from 'rxjs';
import { AggregatorManager } from '../services/aggregator-manager.service';
import { BaseAggregatorRunner } from '../aggregator-runners/base.runner';

@Injectable()
export class ReportSubmittedEventHandler
	implements IEventHandler, OnModuleInit, OnModuleDestroy
{
	constructor(
		protected aggregatorRunner: BaseAggregatorRunner,
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
					const reportInstance = new this.reportModel(payload.report);
					return new Observable((subscriber) => {
						this.processReport(reportInstance)
							.then(callback)
							.then((v) => {
								subscriber.next(v);
								subscriber.complete();
							});
					});
				}),
				takeUntil(this.destroy$),
			)
			.subscribe();
	}

	/**
	 * Processes a submitted report.
	 *
	 * @param report - The report document to be processed.
	 * @returns A Promise that resolves to the result of applying the report to the aggregators.
	 */
	private async processReport(report: ReportDocument) {
		return await this.aggregatorRunner.run(async (aggregator) => {
			this.logger.debug(
				`Applying report for resource "${report.resource_id}" to aggregator "${aggregator.constructor.name}"`,
			);
			return await aggregator.applyReport(report);
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
