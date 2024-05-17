import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { Aggregator } from '../interfaces/aggregator.interface';
import { ReportAggregatorModuleOptions } from '../interfaces/report-aggregator-options.interface';
import { MODULE_OPTIONS_TOKEN } from '../report-aggregator.module-definition';
import {
	IManyReportsSubmittedEventPayload,
	ManyReportsSubmittedEvent,
} from '../../submit-reports/events/events';
import { OnEvent } from '@nestjs/event-emitter';
import { IEventHandler } from '@nestjs/cqrs';

@Injectable()
export class ManyReportsSubmittedHandler implements IEventHandler {
	constructor(
		@Inject(MODULE_OPTIONS_TOKEN)
		protected options: ReportAggregatorModuleOptions,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
	) {
		this.aggregator = options.aggregator;
	}

	aggregator: Aggregator;

	@OnEvent(ManyReportsSubmittedEvent, { async: true, promisify: true })
	async handle(payload: IManyReportsSubmittedEventPayload) {
		const reportDocuments = payload.reports.map(
			(report) => new this.reportModel(report),
		);
		reportDocuments.sort(
			(a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
		);

		for (const report of reportDocuments) {
			await this.aggregator.applyReport(report);
		}
	}
}
