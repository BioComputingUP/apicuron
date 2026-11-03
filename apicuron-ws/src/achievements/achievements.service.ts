import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AchievementState } from '../core/enums';
import { Badge, BadgeModel, Medal, MedalModel } from '../core/schemas';
import { PartnerResourcesService } from '../resources/partner-resources/services/partner-resources.service';

@Injectable()
export class AchievementsService {
	constructor(
		protected partnerResourceService: PartnerResourcesService,
		@InjectModel(Badge.name) protected badgeModel: BadgeModel,
		@InjectModel(Medal.name) protected medalModel: MedalModel,
	) {}

	public async user_badge_count(resource_id: string, curator_orcid: string) {
		return await this.badgeModel.count({
			resource_id,
			curator_orcid,
			state: AchievementState.achieved,
		});
	}

	public async user_medal_count(resource_id: string, curator_orcid: string) {
		return await this.medalModel.count({
			resource_id,
			curator_orcid,
			state: AchievementState.achieved,
		});
	}
}
