import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BadgeDef, BadgeDefDocument } from 'src/core/schemas';
import { AssignBadgeDto } from '../dto/assign-badge.dto';

@Injectable()
export class AssignableBadgesService {
	private readonly logger = new Logger(AssignableBadgesService.name);
	constructor(
		@InjectModel(BadgeDef.name)
		protected badgeDefModel: Model<BadgeDefDocument>,
		protected eventEmitter: EventEmitter2,
	) {}
	async assign_badge_to_users(assignBadgeDto: AssignBadgeDto) {
		const { badge_name, user_orcids } = assignBadgeDto;
		const updatedBadgeDef = await this.badgeDefModel.findOneAndUpdate(
			{
				name: badge_name,
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
		}

		this.logger.log(
			`Badge ${badge_name} assigned to ${user_orcids.length} users`,
		);
		return updatedBadgeDef.toObject();
	}
	async withdraw_badge_from_user(assignBadgeDto: AssignBadgeDto) {
		const { badge_name, user_orcids } = assignBadgeDto;
		const updatedBadgeDef = await this.badgeDefModel
			.findOneAndUpdate(
				{
					name: badge_name,
				},
				{
					$pull: {
						assigned_to: {
							$in: user_orcids,
						},
					},
				},
				{ new: true },
			)
			.lean();
		if (!updatedBadgeDef) {
			throw new BadRequestException(
				`Badge Def with name "${badge_name}" not found`,
			);
		}
		return updatedBadgeDef;
	}
}
