import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { MongoServerError, MongoWriteConcernError } from 'mongodb';
import { FilterQuery, Model, UpdateWriteOpResult } from 'mongoose';
import { AchievementState, PrivacyType } from '../../core/enums';
import {
	BadgeDef,
	BadgeDefDocument,
	BadgeDefModel,
} from '../../core/schemas/achievements-def/badge-def.schema';
import {
	Badge,
	BadgeDocument,
	BadgeModel,
} from '../../core/schemas/achievements/badges.schema';
import {
	LeanReportDocument,
	Report,
	ReportDocument,
	ReportModel,
} from '../../core/schemas/reports.schema';
import { Aggregator } from '../../event-orchestrator/interfaces/aggregator.interface';
import { computeAggregatePrivacyField } from '../../util/privacy.helper';
import {
	getRelatedBadges,
	getReportRelatedBadgeDefFilter,
	getReportRelatedBadgeFilter,
} from '../helpers/helpers';

import { getEventSubject } from 'src/core/helpers/events.helper';
import {
	UserCreatedEvent,
	UserUpdatedEvent,
} from 'src/core/repositories/user.repository';
import { PartnerResource } from 'src/core/schemas/index';
import { TermDocument } from '../../core/schemas/terms.schema';
import { User } from '../../core/schemas/user.schema';
import { AggregatorClass } from '../../event-orchestrator/decorators/aggregator.decorator';
import { LeagueUpdatedEvent } from '../../resources/partner-resources/leagues/events/league-updated.event';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import {
	ResourceBadgesUpdatedEvent,
	UserBadgesUpdatedEvent,
} from '../events/badge-count-updated.event';
import { ComputeBadgesService } from './compute-badges.service';
@Injectable()
@AggregatorClass()
export class BadgeAggregatorService implements Aggregator {
	constructor(
		@InjectModel(BadgeDef.name)
		protected badgeDefModel: BadgeDefModel,
		@InjectModel(Report.name) protected reportModel: ReportModel,
		@InjectModel(Badge.name) protected badgeModel: BadgeModel,
		protected resourceService: PartnerResourcesService,

		protected computeBadges: ComputeBadgesService,
		protected eventEmitter: EventEmitter2,
	) {}
	async recomputeAllResourceAggregates(resource_id: string) {
		await this.removeAllResourceAggregates(resource_id);
		await this.applyAllReports(resource_id);
	}

	async updatedLeague(leagueUpdated: LeagueUpdatedEvent): Promise<number> {
		if (!leagueUpdated.privacyChanged()) {
			return 0;
		}

		const newPrivacy = leagueUpdated.newValue.visibility;
		const filter = {
			resource_id: leagueUpdated.resource.resource_id,
			league: leagueUpdated.newValue.name,
		};

		const badgeDefUpdate$ = this.badgeDefModel.updateMany(filter, {
			$set: {
				privacy: newPrivacy,
			},
		});

		const badgeUpdate$ = this.badgeModel.updateMany(filter, {
			$set: {
				privacy: newPrivacy,
			},
		});

		const [medalDefUpdate, medalUpdate] = await Promise.all([
			badgeDefUpdate$,
			badgeUpdate$,
		]);

		return medalDefUpdate.modifiedCount + medalUpdate.modifiedCount;
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
	async updatedUser(event: UserCreatedEvent | UserUpdatedEvent) {
		const user: User = getEventSubject(event);
		const { orcid_id: curator_orcid, privacy } = user;

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
		const updates$: Promise<UpdateWriteOpResult>[] = [];
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
				updates$.push(update$.exec());
			}
		}

		await Promise.all(updates$);
	}

	logger = new Logger(BadgeAggregatorService.name);

	private async createOrUpdateBadge(
		badgeDef: BadgeDefDocument,
		report: ReportDocument | LeanReportDocument,
	): Promise<AchievementState> {
		const badgeFilter: FilterQuery<BadgeDocument> = {
			$and: [getReportRelatedBadgeFilter(report), getRelatedBadges(badgeDef)],
		};
		const badge = await this.badgeModel.findOne(badgeFilter).lean();
		if (!badge) {
			const newBadge = this.computeBadges.initBadgeFromReport(badgeDef, report);
			try {
				await this.badgeModel.create(newBadge);
				this.logger.log(`Badge ${newBadge.name} created`);
				return newBadge.state;
			} catch (error) {
				if (error instanceof MongoServerError && error.code == 11000) {
					// Duplicate key error
					// retry operation
					this.logger.log('Duplicate key error..., retrying');
					this.logger.error(error.message, error.stack, error.name);
					return await this.createOrUpdateBadge(badgeDef, report);
				}
				throw error;
			}
		}

		const newBadge = this.computeBadges.applyReportOnBadge(badge, report);
		newBadge._id = badge._id; // preserve the _id for the update operation

		try {
			const result = await this.badgeModel.replaceOne(badge, newBadge);
			if (result.modifiedCount === 0) {
				this.logger.warn(
					`Badge ${badge.name} not updated, no changes detected. The original badge was modified, retrying...`,
				);
				return await this.createOrUpdateBadge(badgeDef, report);
			}
			return badge.state;
		} catch (error) {
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
		const badgesUpdated$: Promise<AchievementState>[] = [];
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

	public async createBadges(
		badgeDefFilter: FilterQuery<BadgeDefDocument> = {},
	): Promise<{ badgeCount: number; badgeDefsCount: number }> {
		let badgeDefCount = 0;

		const badgeDefs = this.badgeDefModel
			.find(
				badgeDefFilter,
				{},
				{
					sort: { resource_id: -1, league: -1 },
				},
			)
			.cursor({ batchSize: 100 });

		const userBadgesPromises$ = [];

		for await (const badgeDef of badgeDefs) {
			badgeDefCount++;

			const badges = this.computeBadges.produceBadgesFromDef(badgeDef);

			const badges$ = [];
			for await (const badge of badges) {
				const computeBadge$ = this.badgeModel.create(badge);
				badges$.push(computeBadge$);
			}

			userBadgesPromises$.push(Promise.all(badges$));

			this.logger.log(
				`Badge ${badgeDef.name} computed for ${badges$.length} users`,
			);
		}

		await Promise.all(userBadgesPromises$);

		this.logger.log(`Computed ${userBadgesPromises$.length} badges`);

		return {
			badgeCount: userBadgesPromises$.length,
			badgeDefsCount: badgeDefCount,
		};
	}

	async applyAllReports(resource_id: string) {
		const badgeDefFilter: FilterQuery<BadgeDefDocument> = {
			resource_id,
		};
		await this.createBadges(badgeDefFilter);

		await this.eventEmitter.emitAsync(
			ResourceBadgesUpdatedEvent.name,
			new ResourceBadgesUpdatedEvent(resource_id),
		);
	}

	async removeAllResourceAggregates(resource_id: string) {
		await this.badgeModel.deleteMany({ resource_id });
	}

	/**
	 * Does nothing, badges do not change when terms are updated
	 * @returns
	 */
	async termUpdated() {
		return;
	}
	async termDeleted(
		term_name: string,
		resource_id: string,
		league_name: string,
	) {
		// Retrieve the list of badge definitions that are effected by the term deletion
		const affectedBadges = await this.badgeDefModel.find(
			{
				resource_id: resource_id,
				league: league_name,
				list_terms: term_name,
			},
			{ _id: 1 },
		);
		if (affectedBadges.length === 0) {
			return;
		}
		// Extract the ids of the affected badges
		const affectedIds = affectedBadges.map((badge) => badge._id);
		// Remove the term from the list of terms in the badge definitions
		await this.badgeDefModel.updateMany(
			{
				resource_id: resource_id,
				league: league_name,
				list_terms: term_name,
			},
			{
				$pull: { list_terms: term_name },
			},
		);
		// Recompute the badges that are affected by the term deletion
		await this.reComputeBadges({
			_id: { $in: affectedIds },
		});
	}

	public async reComputeBadges(
		filter: FilterQuery<BadgeDefDocument>,
	): Promise<{ badgeCount: number; badgeDefsCount: number }> {
		await this.badgeModel.deleteMany(filter);
		return await this.createBadges(filter);
	}
	updatedResource(_after: PartnerResource): Promise<void> {
		return; // badges have no reference to the resource
	}
}
