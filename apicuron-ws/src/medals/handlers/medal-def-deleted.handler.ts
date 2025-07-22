import { Injectable } from '@nestjs/common';
import { MedalAggregatorService } from '../services/medal-aggregator.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { MedalDefDeletedEvent } from '../events/medal-def-deleted.event';
import { InjectModel } from '@nestjs/mongoose';
import {
	Medal,
	MedalDocument,
} from '../../core/schemas/achievements/medals.schema';
import { Model } from 'mongoose';
import { ResourceMedalsCountUpdatedEvent } from '../events/medal-count-updated.event';

@Injectable()
export class MedalDefDeletedEventHandler {
	constructor(
		protected eventEmitter: EventEmitter2,
		@InjectModel(Medal.name) protected medalModel: Model<MedalDocument>,
	) {}

	@OnEvent(MedalDefDeletedEvent.name, { promisify: true, async: true })
	async handle({ medalDef }: MedalDefDeletedEvent) {
		await this.medalModel.deleteMany({
			resource_id: medalDef.resource_id,
			name: medalDef.name,
			league: medalDef.league,
		});

		await this.eventEmitter.emitAsync(
			ResourceMedalsCountUpdatedEvent.name,
			new ResourceMedalsCountUpdatedEvent(medalDef.resource_id),
		);
	}
}
