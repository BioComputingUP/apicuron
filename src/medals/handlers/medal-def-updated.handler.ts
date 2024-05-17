import { Injectable } from '@nestjs/common';
import { MedalAggregatorService } from '../services/medal-aggregator.service';
import { OnEvent } from '@nestjs/event-emitter';
import { MedalDefUpdatedEvent } from '../events/medal-def-updated.event';

@Injectable()
export class MedalDefUpdatedEventHandler {
	constructor(protected medalAggregator: MedalAggregatorService) {}

	@OnEvent(MedalDefUpdatedEvent.name, { promisify: true, async: true })
	async handle(medalDefDeleted: MedalDefUpdatedEvent) {
		await this.medalAggregator.removeAllResourceAggregates(
			medalDefDeleted.medalDef.resource_id,
		);
		await this.medalAggregator.applyAllReports(
			medalDefDeleted.medalDef.resource_id,
		);
	}
}
