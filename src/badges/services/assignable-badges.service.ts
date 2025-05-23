import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BadgeDef, BadgeDefDocument } from 'src/core/schemas';
import { AssignBadgeDto } from '../dto/assign-badge.dto';

@Injectable()
export class AssignableBadgesService {
	constructor(
		@InjectModel(BadgeDef.name)
		protected badgeDefModel: Model<BadgeDefDocument>,
	) {}
	async assign_badge_to_users(assignBadgeDto: AssignBadgeDto) {
		const { badge_name, user_orcids } = assignBadgeDto;
		const updatedBadgeDef = await this.badgeDefModel
			.findOneAndUpdate(
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
			)
			.lean();
		// TODO: trigger event for aggregation
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

		return updatedBadgeDef;
	}
	async remove_badge_from_user(badge: BadgeDef, user_orcids: string[]) {
		const updatedBadgeDef = await this.badgeDefModel
			.findOneAndUpdate(
				{
					name: badge.name,
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
				`Badge Def with name "${badge.name}" not found`,
			);
		}
		return updatedBadgeDef;
	}
}
