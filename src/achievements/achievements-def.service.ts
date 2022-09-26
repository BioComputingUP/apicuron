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
		@InjectModel('badge') private badgeModel: Model<BadgeDefDocument>,
		@InjectModel('medal') private medalModel: Model<MedalDefDocument>,
		@InjectModel(AchievementDef.name)
		private achievementModel: Model<AchievementDocument>,
	) {}
	async get_medals(resource_uri?: string) {
		if (resource_uri) {
			return await this.medalModel.find({
				resource_uri,
			});
		}
		return await this.medalModel.find();
	}

	async get_badges(resource_uri?: string) {
		if (resource_uri) {
			return await this.badgeModel.find({
				resource_uri,
			});
		}
		return await this.badgeModel.find();
	}

	async count() {
		return await this.achievementModel.count();
	}

	async medal_count() {
		return await this.medalModel.count();
	}
	async badges_count() {
		return await this.badgeModel.count();
	}
}
