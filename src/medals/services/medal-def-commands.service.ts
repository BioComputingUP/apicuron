import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
	BadgeDef,
	BadgeDefDocument,
} from '../../core/schemas/achievements-def/badge-def.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Model } from 'mongoose';
import { UpdateMedalDefDto as UpdateMedalDefDto } from '../dto/update-medal-def.dto';
import { MedalDefUpdatedEvent } from '../events/medal-def-updated.event';
import { DeleteMedalDefDto } from '../dto/delete-medal-def.dto';
import { MedalDefDeletedEvent } from '../events/medal-def-deleted.event';
import { PartnerResourcesService } from '../../resources/partner-resources/partner-resources.service';
import { CreateMedalDefDto } from '../dto/create-medal-def.dto';
import { assignResourceEntityPrivacyField } from '../../util/privacy.helper';
import { MedalDefCreatedEvent } from '../events/medal-def-created.event';
import {
	MedalDef,
	MedalDefDocument,
} from '../../core/schemas/achievements-def/medal-def.schema';

@Injectable()
export class MedalDefCommandsService {
	constructor(
		@InjectModel(MedalDef.name)
		protected medalDefModel: Model<MedalDefDocument>,
		protected eventEmitter: EventEmitter2,
		protected resourceService: PartnerResourcesService,
	) {}

	async updateMedalDef(medalUpdate: UpdateMedalDefDto) {
		const { resource_id, name, league, ...updates } = medalUpdate;

		const medal: MedalDefDocument = await this.medalDefModel.findOneAndUpdate(
			{
				resource_id,
				name,
				league,
			},
			{
				$set: updates,
			},
			{
				new: true,
			},
		);

		await this.eventEmitter.emitAsync(
			MedalDefUpdatedEvent.name,
			new MedalDefUpdatedEvent(medal),
		);

		return medal;
	}

	async deleteMedalDef(deleteMedalDef: DeleteMedalDefDto) {
		const resource = await this.resourceService.get_resource(
			deleteMedalDef.resource_id,
		);

		deleteMedalDef.league = deleteMedalDef.league ?? resource.defaultLeague;
		const medalDef = await this.medalDefModel.findOneAndDelete({
			...deleteMedalDef,
		});

		await this.eventEmitter.emitAsync(
			MedalDefDeletedEvent.name,
			new MedalDefDeletedEvent(medalDef),
		);
		return 1;
	}

	async createMedalDef(medalDef: CreateMedalDefDto) {
		const resource = await this.resourceService.get_resource(
			medalDef.resource_id,
		);

		const newMedalDef = new this.medalDefModel({
			...medalDef,
			resource_uri: resource.resource_uri,
		});

		assignResourceEntityPrivacyField(resource, newMedalDef);

		await newMedalDef.save();

		this.eventEmitter.emit(
			MedalDefCreatedEvent.name,
			new MedalDefCreatedEvent(newMedalDef),
		);
		return newMedalDef;
	}
}
