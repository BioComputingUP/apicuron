import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
	BadgeDef,
	BadgeDefDocument,
} from '../../core/schemas/achievements-def/badge-def.schema';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import { assignResourceEntityPrivacy } from '../../util/privacy.helper';
import { CreateBadgeDefDto } from '../dto/create-badge-def.dto';
import { DeleteBadgeDefDto } from '../dto/delete-badge-def.dto';
import { UpdateBadgeDefDto } from '../dto/update-badge-def.dto';
import { BadgeDefCreatedEvent } from '../events/badge-def-created.event';
import { BadgeDefDeletedEvent } from '../events/badge-def-deleted.event';
import { BadgeDefUpdatedEvent } from '../events/badge-def-updated.event';

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

		const resource = await this.resourceService.get_resource(resource_id);

		const badgeDef = await this.badgeDefModel.findOneAndUpdate(
			{
				resource_id,
				name,
				league: updateBadge.league ?? resource.defaultLeague,
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
		const resource = await this.resourceService.get_resource(
			deleteBadge.resource_id,
		);

		deleteBadge.league = deleteBadge.league ?? resource.defaultLeague;

		const badgeDef = await this.badgeDefModel.findOneAndDelete({
			resource_id: deleteBadge.resource_id,
			name: deleteBadge.name,
			league: deleteBadge.league,
		});

		if (!badgeDef) {
			throw new BadRequestException(
				`Badge ${deleteBadge.name} from resource ${deleteBadge.resource_id}:${deleteBadge.league} not found, cannot be deleted`,
			);
		}

		await this.eventEmitter.emitAsync(
			BadgeDefDeletedEvent.name,
			new BadgeDefDeletedEvent(badgeDef),
		);

		return badgeDef;
	}

	async createBadgeDef(badgeDef: CreateBadgeDefDto) {
		const resource = await this.resourceService.get_resource(
			badgeDef.resource_id,
		);
		if (!badgeDef.league) {
			badgeDef.league = resource.defaultLeague;
		}

		const badgeDefExists = await this.badgeDefModel.exists({
			resource_id: badgeDef.resource_id,
			name: badgeDef.name,
			league: badgeDef.league,
		});
		if (badgeDefExists) {
			throw new BadRequestException(
				`Badge ${badgeDef.name} for resource ${badgeDef.resource_id}:${badgeDef.league} already exists`,
			);
		}
		const newBadge = new this.badgeDefModel({
			...badgeDef,
			privacy: resource.getLeague(badgeDef.league).visibility,
			resource_uri: resource.resource_uri,
		});
		assignResourceEntityPrivacy(resource, newBadge);

		try {
			await newBadge.save();
		} catch (err) {
			throw new InternalServerErrorException(
				`Error occured while creating badge ${newBadge.name}`,
			);
		}

		await this.eventEmitter.emitAsync(
			BadgeDefCreatedEvent.name,
			new BadgeDefCreatedEvent(newBadge),
		);
		return newBadge;
	}
}
