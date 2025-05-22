import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BadgeDef, BadgeDefDocument } from 'src/core/schemas';

@Injectable()
export class AssignableBadgesService {
	constructor(
		@InjectModel(BadgeDef.name)
		protected badgeDefModel: Model<BadgeDefDocument>,
	) {}
	async assign_badge_to_user(badge_name: string, user_orcid: string) {
		const badgeDef = await this.badgeDefModel.findOne({
			name: badge_name,
		});
		if (!badgeDef.assignable) {
			throw new BadRequestException(
				`Badge ${badge_name} is not manually assignable`,
			);
		}
		const newBadgeDef = this.badgeDefModel.findOneAndUpdate(
			{
				name: badge_name,
			},
			{
				$addToSet: {
					assigned_to: user_orcid,
				},
			},
			{ new: true },
		);
		return newBadgeDef;
	}
	async remove_badge_from_user(badge: BadgeDef, user_orcid: string) {}
}
