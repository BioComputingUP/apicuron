import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { Aggregator } from '../interfaces/aggregator.interface';
import { ReportAggregatorModuleOptions } from '../interfaces/report-aggregator-options.interface';
import { MODULE_OPTIONS_TOKEN } from '../report-aggregator.module-definition';
import { IEventHandler } from '@nestjs/cqrs';
import { OnEvent } from '@nestjs/event-emitter';
import {
	AllResourceReportsDeletedEvent,
	IAllResourceReportsDeletedEventPayload,
} from '../../submit-reports/events/events';
import { Inject } from '@nestjs/common';

export class ResourceReportsDeletedHandler implements IEventHandler {
	constructor(
		@Inject(MODULE_OPTIONS_TOKEN)
		protected options: ReportAggregatorModuleOptions,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
	) {
		this.aggregator = options.aggregator;
	}

	aggregator: Aggregator;

	@OnEvent(AllResourceReportsDeletedEvent, { async: true, promisify: true })
	async handle({ resource_id }: IAllResourceReportsDeletedEventPayload) {
		await this.aggregator.removeAllResourceAggregates(resource_id);
	}
}
