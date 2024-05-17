import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
	IReportSubmittedEventPayload,
	ReportSubmittedEvent,
} from '../../submit-reports/events/events';
import { MODULE_OPTIONS_TOKEN } from '../report-aggregator.module-definition';
import { ReportAggregatorModuleOptions } from '../interfaces/report-aggregator-options.interface';
import { Aggregator } from '../interfaces/aggregator.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { Model } from 'mongoose';
import { IEventHandler } from '@nestjs/cqrs';

@Injectable()
export class ReportSubmittedEventHandler implements IEventHandler {
	constructor(
		@Inject(MODULE_OPTIONS_TOKEN)
		protected options: ReportAggregatorModuleOptions,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
	) {
		this.aggregator = options.aggregator;
	}

	aggregator: Aggregator;

	@OnEvent(ReportSubmittedEvent, { async: true, promisify: true })
	async handle(payload: IReportSubmittedEventPayload) {
		const reportInstance = new this.reportModel(payload.report);
		await this.aggregator.applyReport(reportInstance);
	}
}
