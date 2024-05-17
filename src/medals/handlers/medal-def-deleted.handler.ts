import { Injectable } from '@nestjs/common';
import { MedalAggregatorService } from '../services/medal-aggregator.service';
import { OnEvent } from '@nestjs/event-emitter';
import { MedalDefDeletedEvent } from '../events/medal-def-deleted.event';

@Injectable()
export class MedalDefDeletedEventHandler {
	constructor(protected medalAggregator: MedalAggregatorService) {}

	@OnEvent(MedalDefDeletedEvent.name, { promisify: true, async: true })
	async handle(medalDefDeleted: MedalDefDeletedEvent) {
		await this.medalAggregator.removeAllResourceAggregates(
			medalDefDeleted.medalDef.resource_id,
		);
		await this.medalAggregator.applyAllReports(
			medalDefDeleted.medalDef.resource_id,
		);
	}
}
