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

import { ComputeBadgesService } from './compute-badges.service';
import {
	ResourceBadgesUpdatedEvent,
	UserBadgesUpdatedEvent,
} from '../events/badge-count-updated.event';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import { BadgeEarnedEvent } from '../events/badge-earned.event';
import { AggregatorClass } from '../../event-orchestrator/decorators/aggregator.decorator';
@Injectable()
@AggregatorClass()
export class BadgeAggregatorService implements Aggregator {
	constructor(
		@InjectModel(BadgeDef.name)
		protected badgeDefModel: Model<BadgeDefDocument>,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
		@InjectModel(Badge.name) protected badgeModel: Model<BadgeDocument>,
		protected resourceService: PartnerResourcesService,

		protected computeBadges: ComputeBadgesService,
		protected eventEmitter: EventEmitter2,
	) {}
	async recomputeAllResourceAggregates(resource_id: string) {
		await this.removeAllResourceAggregates(resource_id);
		await this.applyAllReports(resource_id);
	}

	async deleteLeague(resource_id: string, league: string): Promise<number> {
		const medalDefDeleted$ = this.badgeDefModel.deleteMany({
			resource_id,
			league,
		});

		const medalDeleted$ = this.badgeModel.deleteMany({
			resource_id,
			league,
		});

		const [medalDefDeleted, medalDeleted] = await Promise.all([
			medalDefDeleted$,
			medalDeleted$,
		]);

		return medalDefDeleted.deletedCount + medalDeleted.deletedCount;
	}
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
	): Promise<AchievementState> {
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

				badge.achieved_at = report.timestamp;
				await badge.save();

				await this.eventEmitter.emitAsync(
					BadgeEarnedEvent.name,
					new BadgeEarnedEvent(badge),
				);

				return AchievementState.achieved;
			}

			return AchievementState.progress;
		} catch (error: any) {
			if (error instanceof MongoServerError && error.code == 11000) {
				// Duplicate key error
				// retry operation
				this.logger.log('Duplicate key error..., retrying');
				this.logger.error(error.message, error.stack, error.name);
				return await this.createOrUpdateBadge(badgeDef, report);
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
		const badgesUpdated$ = [];
		for await (const badgeDef of affectedBadgeDefs) {
			const badgeUpdate$ = this.createOrUpdateBadge(badgeDef, report);

			badgesUpdated$.push(badgeUpdate$);
		}

		const badgesUpdated = await Promise.all(badgesUpdated$);

		if (!badgesUpdated.includes(AchievementState.achieved)) {
			return;
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
		performance.mark('before_compute_badges');
		await this.computeBadges.computeBadges(badgeDefFilter);
		performance.mark('after_compute_badges');
		const m = performance.measure(
			'compute_badges',
			'before_compute_badges',
			'after_compute_badges',
		);

		this.logger.warn(`Compute Badges took ${m.duration} ms`);

		await this.eventEmitter.emitAsync(
			ResourceBadgesUpdatedEvent.name,
			new ResourceBadgesUpdatedEvent(resource_id),
		);
	}

	async removeAllResourceAggregates(resource_id: string) {
		return await this.badgeModel.deleteMany({ resource_id });
	}
}
