import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import {
	Badge,
	BadgeDocument,
} from '../../core/schemas/achievements/badges.schema';
import { FilterQuery, Model } from 'mongoose';
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
import {
	ResourceBadgesUpdatedEvent,
	UserBadgesUpdatedEvent,
} from '../../badges/events/badge-count-updated.event';

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
		this.logger.debug(
			`Updating resource medal count for Resource "${payload.resource_id}"`,
		);
		let statCount = 0;
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
			statCount++;
		}

		this.logger.debug(
			`Updated ${statCount} statistics documents with medals Count`,
		);
		await Promise.all(statUpdates$);
	}

	@OnEvent(UserMedalsCountUpdatedEvent.name, { promisify: true, async: true })
	async updateUserMedalCount(payload: UserMedalsCountUpdatedEvent) {
		const filter: FilterQuery<MedalDocument> = {
			resource_id: payload.resource_id,
			curator_orcid: payload.curator_orcid,
			league: payload.league,
			state: AchievementState.achieved,
		};
		const medalCount = await this.medalModel.countDocuments(filter);

		await this.statModel.findOneAndUpdate(filter, {
			$set: { medals_count: medalCount },
		});
		return;
	}

	@OnEvent(ResourceBadgesUpdatedEvent.name, { promisify: true, async: true })
	async updateResourceBadgeCount(payload: ResourceBadgesUpdatedEvent) {
		this.logger.debug(
			`Updating resource badge count for Resource "${payload.resource_id}"`,
		);
		let statCount = 0;
		const stats = this.statModel
			.find({ resource_id: payload.resource_id })
			.cursor({ batchSize: 50 });

		const statUpdates$ = [];
		for await (const stat of stats) {
			const update$ = this.badgeModel
				.countDocuments({
					resource_id: payload.resource_id,
					curator_orcid: stat.curator_orcid,
					league: stat.league,
					state: AchievementState.achieved,
				})
				.then((count: number) => {
					stat.badges_count = count;
					return stat.save();
				});
			statUpdates$.push(update$);
			statCount++;
		}

		this.logger.debug(
			`Updated ${statCount} statistics documents with badges Count`,
		);
		await Promise.all(statUpdates$);
	}

	@OnEvent(UserBadgesUpdatedEvent.name, { promisify: true, async: true })
	async updateUserBadgeCount(payload: UserMedalsCountUpdatedEvent) {
		const filter = {
			resource_id: payload.resource_id,
			curator_orcid: payload.curator_orcid,
			league: payload.league,
			state: AchievementState.achieved,
		};
		const badgeCount = await this.badgeModel.countDocuments(filter);

		await this.statModel.findOneAndUpdate(filter, {
			$set: { badges_count: badgeCount },
		});
		return;
	}
}
