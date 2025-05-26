import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BadgeDef, BadgeDefDocument } from 'src/core/schemas';
import { AssignBadgeDto } from '../dto/assign-badge.dto';
import { BadgeDefCreatedEvent } from '../events/badge-def-created.event';
import { BadgeDefUpdatedEvent } from '../events/badge-def-updated.event';

@Injectable()
export class AssignableBadgesService {
	private readonly logger = new Logger(AssignableBadgesService.name);
	constructor(
		@InjectModel(BadgeDef.name)
		protected badgeDefModel: Model<BadgeDefDocument>,
		protected eventEmitter: EventEmitter2,
	) {}
	private async check_if_badge_is_assignable(
		badge_name: string,
	): Promise<BadgeDefDocument> {
		const existingBadgeDef = await this.badgeDefModel.findOne({
			name: badge_name,
		});
		if (!existingBadgeDef) {
			throw new BadRequestException(
				`Badge Def with name "${badge_name}" not found`,
			);
		}
		if (!existingBadgeDef.assignable) {
			throw new BadRequestException(
				`Badge ${badge_name} is not manually assignable`,
			);
		}
		return existingBadgeDef;
	}
	async assign_badge_to_users(assignBadgeDto: AssignBadgeDto) {
		const { badge_name, resource_id, user_orcids } = assignBadgeDto;
		await this.check_if_badge_is_assignable(badge_name);
		const updatedBadgeDef = await this.badgeDefModel.findOneAndUpdate(
			{
				name: badge_name,
				resource_id: resource_id,
			},
			{
				$addToSet: {
					assigned_to: {
						$each: user_orcids,
					},
				},
			},
			{ new: true },
		);
		if (!updatedBadgeDef) {
			throw new InternalServerErrorException(
				`Error assigning to ${badge_name}`,
			);
		}
		await this.eventEmitter.emitAsync(
			BadgeDefCreatedEvent.name,
			new BadgeDefCreatedEvent(updatedBadgeDef),
		);
		return updatedBadgeDef.toObject();
	}
	async withdraw_badge_from_user(assignBadgeDto: AssignBadgeDto) {
		const { badge_name, resource_id, user_orcids } = assignBadgeDto;
		await this.check_if_badge_is_assignable(badge_name);
		const updatedBadgeDef = await this.badgeDefModel.findOneAndUpdate(
			{
				name: badge_name,
				resource_id: resource_id,
			},
			{
				$pull: {
					assigned_to: {
						$in: user_orcids,
					},
				},
			},
			{ new: true },
		);
		if (!updatedBadgeDef) {
			throw new InternalServerErrorException(
				`Error assigning to ${badge_name}`,
			);
		}
		await this.eventEmitter.emitAsync(
			BadgeDefUpdatedEvent.name,
			new BadgeDefUpdatedEvent(updatedBadgeDef),
		);
		return updatedBadgeDef.toObject();
	}
}
