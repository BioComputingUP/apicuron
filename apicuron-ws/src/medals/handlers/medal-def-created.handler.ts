import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { MedalDefCreatedEvent } from '../events/medal-def-created.event';
import { ComputeMedalsService } from '../services/compute-medals.service';
import { ResourceMedalsCountUpdatedEvent } from '../events/medal-count-updated.event';

@Injectable()
export class MedalDefCreatedEventHandler {
	constructor(
		protected computeMedals: ComputeMedalsService,
		protected eventEmitter: EventEmitter2,
	) {}

	@OnEvent(MedalDefCreatedEvent.name, { promisify: true, async: true })
	async handle({ medalDef }: MedalDefCreatedEvent) {
		await this.computeMedals.computeMedalsForMedalDef(medalDef);

		await this.eventEmitter.emitAsync(
			ResourceMedalsCountUpdatedEvent.name,
			new ResourceMedalsCountUpdatedEvent(medalDef.resource_id),
		);
	}
}
