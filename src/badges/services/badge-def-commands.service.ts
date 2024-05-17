import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
	BadgeDef,
	BadgeDefDocument,
} from '../../core/schemas/achievements-def/badge-def.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Model } from 'mongoose';
import { UpdateBadgeDefDto } from '../dto/update-badge-def.dto';
import { BadgeDefUpdatedEvent } from '../events/badge-def-updated.event';
import { DeleteBadgeDefDto } from '../dto/delete-badge-def.dto';
import { BadgeDefDeletedEvent } from '../events/badge-def-deleted.event';
import { PartnerResourcesService } from '../../resources/partner-resources/partner-resources.service';
import { CreateBadgeDefDto } from '../dto/create-badge-def.dto';
import { assignResourceEntityPrivacyField } from '../../util/privacy.helper';
import { BadgeDefCreatedEvent } from '../events/badge-def-created.event';

@Injectable()
export class BadgeDefCommandsService {
	constructor(
		@InjectModel(BadgeDef.name)
		protected badgeDefModel: Model<BadgeDefDocument>,
		protected eventEmitter: EventEmitter2,
		protected resourceService: PartnerResourcesService,
	) {}

	async updateBadgeDef(updateBadge: UpdateBadgeDefDto) {
		const { resource_id, name, ...updates } = updateBadge;

		const badgeDef = await this.badgeDefModel.findOneAndUpdate(
			{
				resource_id,
				name,
				league: updateBadge.league,
			},
			{
				$set: updates,
			},
			{ new: true },
		);

		if (!badgeDef) {
			throw new InternalServerErrorException(`Badge ${name} not found`);
		}

		await this.eventEmitter.emitAsync(
			BadgeDefUpdatedEvent.name,
			new BadgeDefUpdatedEvent(badgeDef),
		);
		return badgeDef;
	}

	async deleteBadgeDef(deleteBadge: DeleteBadgeDefDto) {
		const badgeDef = await this.badgeDefModel.findOneAndDelete({
			resource_id: deleteBadge.resource_id,
			name: deleteBadge.name,
			league: deleteBadge.league,
		});

		await this.eventEmitter.emitAsync(
			BadgeDefDeletedEvent.name,
			new BadgeDefDeletedEvent(badgeDef),
		);

		return {
			data: `Badge ${deleteBadge.name} deleted successfully`,
		};
	}

	async createBadgeDef(badgeDef: CreateBadgeDefDto) {
		const resource = await this.resourceService.get_resource(
			badgeDef.resource_id,
		);
		const newBadge = new this.badgeDefModel({
			...badgeDef,
			resource_uri: resource.resource_uri,
		});
		assignResourceEntityPrivacyField(resource, newBadge);

		try {
			await newBadge.save();
		} catch (err) {
			throw new InternalServerErrorException(
				`Error occured while creating badge ${newBadge.name}`,
			);
		}

		this.eventEmitter.emit(
			BadgeDefCreatedEvent.name,
			new BadgeDefCreatedEvent(newBadge),
		);
		return newBadge;
	}
}
