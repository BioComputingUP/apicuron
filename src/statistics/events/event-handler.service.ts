import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import {
	Badge,
	BadgeDocument,
} from '../../core/schemas/achievements/badges.schema';
import { Model } from 'mongoose';
import {
	Statistics,
	StatisticsDocument,
} from '../../core/schemas/statistics.schema';
import {
	Medal,
	MedalDocument,
} from '../../core/schemas/achievements/medals.schema';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { AchievementState } from '../../core/enums';
import {
	ResourceMedalsCountUpdatedEvent,
	UserMedalsCountUpdatedEvent,
} from '../../medals/events/medal-count-updated.event';

@Injectable()
export class StatisticsEventHandlerService {
	constructor(
		@InjectModel(Badge.name) protected badgeModel: Model<BadgeDocument>,
		@InjectModel(Medal.name) protected medalModel: Model<MedalDocument>,
		@InjectModel(Statistics.name)
		protected statModel: Model<StatisticsDocument>,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
	) {}

	logger = new Logger(StatisticsEventHandlerService.name);

	@OnEvent(ResourceMedalsCountUpdatedEvent.name, {
		promisify: true,
		async: true,
	})
	async updateResourceMedalCount(payload: ResourceMedalsCountUpdatedEvent) {
		const stats = this.statModel
			.find({ resource_id: payload.resource_id })
			.cursor({ batchSize: 50 });

		const statUpdates$ = [];
		for await (const stat of stats) {
			const update$ = this.medalModel
				.countDocuments({
					resource_id: payload.resource_id,
					curator_orcid: stat.curator_orcid,
					league: stat.league,
					state: AchievementState.achieved,
				})
				.then((count: number) => {
					stat.medals_count = count;
					return stat.save();
				});
			statUpdates$.push(update$);
		}
		await Promise.all(statUpdates$);
	}

	@OnEvent(UserMedalsCountUpdatedEvent.name, { promisify: true, async: true })
	async updateUserMedalCount(payload: UserMedalsCountUpdatedEvent) {
		const filter = {
			resource_id: payload.resource_id,
			curator_orcid: payload.curator_orcid,
			league: payload.league,
		};
		const medalCount = await this.medalModel.countDocuments(filter);

		await this.statModel.findOneAndUpdate(filter, {
			$set: { medals_count: medalCount },
		});
		return;
	}
}
