import {
	Inject,
	Injectable,
	Logger,
	OnModuleDestroy,
	OnModuleInit,
} from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
	IReportSubmittedEventPayload,
	ReportSubmittedEvent,
} from '../../submit-reports/events/events';
import { MODULE_OPTIONS_TOKEN } from '../event-orchestrator.module-definition';
import { EventOrchestratorModuleOptions } from '../interfaces/event-orchestrator-options.interface';
import { Aggregator } from '../interfaces/aggregator.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { Model } from 'mongoose';
import { IEventHandler } from '@nestjs/cqrs';
import { Observable, Subject, concatMap, takeUntil } from 'rxjs';

@Injectable()
export class ReportSubmittedEventHandler
	implements IEventHandler, OnModuleInit, OnModuleDestroy
{
	constructor(
		@Inject(MODULE_OPTIONS_TOKEN)
		protected options: EventOrchestratorModuleOptions,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
		protected eventEmitter: EventEmitter2,
	) {
		this.aggregator = options.aggregator;
		this.logger = new Logger(
			`${ReportSubmittedEventHandler.name} (${this.aggregator.constructor.name})`,
		);
	}
	onModuleDestroy() {
		this.destroy$.next();
	}
	logger: Logger;
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
						this.aggregator
							.applyReport(reportInstance)
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

	aggregator: Aggregator;

	/**
	 * A method that submits the event payload to the aggregator
	 * @param payload The payload of the event
	 * @returns A promise that resolves when the event has been processed
	 */
	async submitEventPayload(payload: IReportSubmittedEventPayload) {
		return await new Promise((resolve) => {
			this.eventSubject.next({ payload, callback: resolve });
		});
	}

	@OnEvent(ReportSubmittedEvent, { async: true, promisify: true })
	async handle(payload: IReportSubmittedEventPayload) {
		return await this.submitEventPayload(payload);
	}
}
