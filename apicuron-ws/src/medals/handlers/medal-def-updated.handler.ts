import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { MedalDefUpdatedEvent } from '../events/medal-def-updated.event';
import { ComputeMedalsService } from '../services/compute-medals.service';
import { ResourceMedalsCountUpdatedEvent } from '../events/medal-count-updated.event';

@Injectable()
export class MedalDefUpdatedEventHandler {
	constructor(
		protected computeMedals: ComputeMedalsService,
		protected eventEmitter: EventEmitter2,
	) {}

	@OnEvent(MedalDefUpdatedEvent.name, { promisify: true, async: true })
	async handle({ medalDef }: MedalDefUpdatedEvent) {
		await this.computeMedals.reComputeMedalsForMedalDef(medalDef);

		await this.eventEmitter.emitAsync(
			ResourceMedalsCountUpdatedEvent.name,
			new ResourceMedalsCountUpdatedEvent(medalDef.resource_id),
		);
	}
}
