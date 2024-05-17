import { Injectable } from '@nestjs/common';
import { MedalAggregatorService } from '../services/medal-aggregator.service';
import { OnEvent } from '@nestjs/event-emitter';
import { MedalDefCreatedEvent } from '../events/medal-def-created.event';

@Injectable()
export class MedalDefCreatedEventHandler {
	constructor(protected medalAggregator: MedalAggregatorService) {}

	@OnEvent(MedalDefCreatedEvent.name, { promisify: true, async: true })
	async handle(medalDefDeleted: MedalDefCreatedEvent) {
		await this.medalAggregator.removeAllResourceAggregates(
			medalDefDeleted.medalDef.resource_id,
		);
		await this.medalAggregator.applyAllReports(
			medalDefDeleted.medalDef.resource_id,
		);
	}
}
