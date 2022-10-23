import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
	AchievementDef,
	AchievementDocument,
} from './schemas/achievement-def.schema';
import { BadgeDefDocument } from './schemas/badges_def.schema';
import { MedalDefDocument } from './schemas/medals_def.schema';

@Injectable()
export class AchievementsDefService {
	constructor(
		// @InjectModel('badge') private badgeModel: Model<BadgeDefDocument>,
		// @InjectModel('medal') private medalModel: Model<MedalDefDocument>,
		@InjectModel(AchievementDef.name)
		private achievementModel: Model<AchievementDocument>,
	) {}
	async get_medals(resource_id?: string, resource_uri?: string) {
		if (resource_uri || resource_id) {
			const result =  await this.achievementModel.find({
				'$or': [
					{ resource_uri },
					{ resource_id },
				],
				type:'medal'
			});
			return result;
		}
		return await this.achievementModel.find({ type: 'medal' });
	}

	async get_badges(resource_id?: string, resource_uri?: string) {
		if (resource_uri || resource_id) {
			return await this.achievementModel.find({
				'$or': [
					{ resource_uri },
					{ resource_id }
				],
				type:'badge'
			});
		}
		return await this.achievementModel.find({ type: 'badge'});
	}

	async count() {
		return await this.achievementModel.count();
	}

	async medal_count() {
		return await this.achievementModel.count({ type: 'medal' });
	}
	async badges_count() {
		return await this.achievementModel.count({ type: 'badge' });
	}
}
