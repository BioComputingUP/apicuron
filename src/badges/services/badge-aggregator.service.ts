import { Injectable, Logger } from '@nestjs/common';
import { Aggregator } from '../../event-orchestrator/interfaces/aggregator.interface';
import { FilterQuery, Model } from 'mongoose';
import {
	Report,
	LeanReportDocument,
	ReportDocument,
} from '../../core/schemas/reports.schema';
import { InjectModel } from '@nestjs/mongoose';
import {
	BadgeDef,
	BadgeDefDocument,
} from '../../core/schemas/achievements-def/badge-def.schema';
import {
	Badge,
	BadgeDocument,
} from '../../core/schemas/achievements/badges.schema';
import { getReportRelatedBadgeDefFilter } from '../helpers/helpers';
import { AchievementState, PrivacyType } from '../../core/enums';
import { MongoServerError } from 'mongodb';
import { computeAggregatePrivacyField } from '../../util/privacy.helper';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GroupReportsByUserAggregationService } from '../../aggregation/data-aggregation/aggregators/group-reports-by-user.service';
import { ComputeBadgesService } from './compute-badges.service';
import {
	ResourceBadgesUpdatedEvent,
	UserBadgesUpdatedEvent,
} from '../events/badge-count-updated.event';
import { PartnerResourcesService } from '../../resources/partner-resources/partner-resources.service';
@Injectable()
export class BadgeAggregatorService implements Aggregator {
	constructor(
		@InjectModel(BadgeDef.name)
		protected badgeDefModel: Model<BadgeDefDocument>,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
		@InjectModel(Badge.name) protected badgeModel: Model<BadgeDocument>,
		protected resourceService: PartnerResourcesService,
		protected groupReportsByUser: GroupReportsByUserAggregationService,
		protected computeBadges: ComputeBadgesService,
		protected eventEmitter: EventEmitter2,
	) {}
	async updateUserPrivacy(curator_orcid: string, privacy: PrivacyType) {
		await this.badgeModel.updateMany(
			{
				curator_orcid,
				privacy: PrivacyType.public,
			},
			{
				$set: { privacy },
			},
		);
		const resource_ids = await this.badgeModel.distinct('resource_id', {
			curator_orcid,
		});

		const resources = await this.resourceService.get_resources({
			resource_id: { $in: resource_ids },
		});
		const updates$ = [];
		for (const resource of resources) {
			for (const league of resource.leagues) {
				const update$ = this.badgeModel.updateMany(
					{
						curator_orcid,
						league: league.name,
						resource_id: resource.resource_id,
					},
					{
						$set: {
							privacy: computeAggregatePrivacyField(
								{ privacy: league.visibility },
								{ privacy },
							),
						},
					},
				);
				updates$.push(update$);
			}
		}

		await Promise.all(updates$);
	}

	logger = new Logger(BadgeAggregatorService.name);

	private async createOrUpdateBadge(
		badgeDef: BadgeDefDocument,
		report: ReportDocument | LeanReportDocument,
	) {
		this.logger.log(
			'Applied update to badge ' +
				badgeDef.name +
				' for user ' +
				report.curator_orcid,
		);
		try {
			const badge = await this.badgeModel.findOneAndUpdate(
				{
					name: BadgeDef.name,
					curator_orcid: report.curator_orcid,
					league: badgeDef.league,
					resource_id: badgeDef.resource_id,
				},
				{
					$inc: { count: 1 },
					$setOnInsert: {
						color_code: badgeDef.color_code,
						count_threshold: badgeDef.count_threshold,
						list_terms: badgeDef.list_terms,
						state:
							1 >= badgeDef.count_threshold
								? AchievementState.achieved
								: AchievementState.progress,
						league: badgeDef.league,
						privacy: computeAggregatePrivacyField(badgeDef, report),
					},
				},
				{ upsert: true, new: true },
			);

			const prevState = badge.state;
			badge.state =
				badge.count >= badge.count_threshold
					? AchievementState.achieved
					: AchievementState.progress;
			if (
				prevState != badge.state &&
				badge.state == AchievementState.achieved
			) {
				// Badge earned by this report
				await this.badgeModel.findOneAndUpdate(
					{
						name: BadgeDef.name,
						curator_orcid: report.curator_orcid,
						league: badgeDef.league,
						resource_id: badgeDef.resource_id,
					},
					{ $set: { state: badge.state, achieved_at: report.timestamp } },
				);
			}
			return;
		} catch (error: any) {
			if (error instanceof MongoServerError && error.code == 11000) {
				// Duplicate key error
				// retry operation
				this.logger.log('Duplicate key error..., retrying');
				// this.logger.error(error.message, error.stack, error.name);
			} else {
				throw error;
			}
		}
	}

	async applyReport(report: ReportDocument | LeanReportDocument) {
		const badgeDefsFilter = getReportRelatedBadgeDefFilter(report);

		const affectedBadgeDefs = this.badgeDefModel
			.find(badgeDefsFilter)
			.cursor({ batchSize: 20 });

		for await (const badgeDef of affectedBadgeDefs) {
			await this.createOrUpdateBadge(badgeDef, report);
		}

		await this.eventEmitter.emitAsync(
			UserBadgesUpdatedEvent.name,
			new UserBadgesUpdatedEvent(
				report.resource_id,
				report.league,
				report.curator_orcid,
			),
		);
		return;
	}

	async applyAllReports(resource_id: string) {
		const badgeDefFilter: FilterQuery<BadgeDefDocument> = {
			resource_id,
		};

		await this.computeBadges.computeBadges(badgeDefFilter);

		await this.eventEmitter.emitAsync(
			ResourceBadgesUpdatedEvent.name,
			new ResourceBadgesUpdatedEvent(resource_id),
		);
	}

	async removeAllResourceAggregates(resource_id: string) {
		return await this.badgeModel.deleteMany({ resource_id });
	}
}
