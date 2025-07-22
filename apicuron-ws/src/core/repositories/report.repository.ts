import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import {
	EntityCreatedEvent,
	EntityDeletedEvent,
	EntityUpdatedEvent,
	ManyEntityUpdated,
} from '../events/index';
import { Report, ReportModel } from '../schemas/reports.schema';
import { EntityRepository } from './entity-repository';

export class ReportCreatedEvent extends EntityCreatedEvent<Report> {}
export class ReportUpdatedEvent extends EntityUpdatedEvent<Report> {}
export class ReportDeletedEvent extends EntityDeletedEvent<Report> {}
export class ManyReportUpdatedEvent extends ManyEntityUpdated<Report> {}
export class ReportRepository extends EntityRepository<Report, ReportModel> {
	constructor(
		@InjectModel(Report.name) reportModel: ReportModel,
		eventEmitter: EventEmitter2,
	) {
		super(reportModel);
		this.publisher.pushToEventEmitter(eventEmitter, [
			[EntityCreatedEvent.name, ReportCreatedEvent.name],
			[EntityUpdatedEvent.name, ReportUpdatedEvent.name],
			[EntityDeletedEvent.name, ReportDeletedEvent.name],
			[ManyEntityUpdated.name, ManyReportUpdatedEvent.name],
		]);
	}
}
