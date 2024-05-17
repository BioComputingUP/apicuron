import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { AchievementState } from '../../core/enums';
import {
	Medal,
	MedalDocument,
} from '../../core/schemas/achievements/medals.schema';

@Injectable()
export class EarnedMedalsService {
	constructor(
		@InjectModel(Medal.name) protected medalModel: Model<MedalDocument>,
	) {}

	async getEarnedMedalsCount(filter: FilterQuery<MedalDocument>) {
		return await this.medalModel.count({
			$and: [
				filter,
				{
					state: AchievementState.achieved,
				},
			],
		});
	}
}
