import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, QueryOptions } from 'mongoose';
import { PartnerResourcesService } from '../resources/partner-resources/partner-resources.service';
import {
	UpdateBadgeDefDto,
	CreateBadgeDefDto,
	BadgeDefFilter,
	DeleteBadgeDefDto,
} from './dto/badge-crud.dto';
import {
	CreateMedalDto,
	DeleteMedalDefDto,
	UpdateMedalDefDto,
} from './dto/medal-crud.dto';
import {
	AchievementDef,
	AchievementDefDocument,
} from '../core/schemas/achievements-def/achievement-def.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadgeDefDocument } from '../core/schemas/achievements-def/badge-def.schema';
import { MedalDefDocument } from '../core/schemas/achievements-def/medal-def.schema';
import { AchievementType } from '../core/enums';
import { ComputeMedalsService } from './services/compute-medals.service';
import { ComputeBadgesService } from './services/compute-badges.service';
import {
	IBadgeDefDeleteEventPayload,
	IBadgeDefUpdateEventPayload,
	IMedalDefDeleteEventPayload,
	IMedalDefUpdateEventPayload,
	onBadgeDefDelete,
	onBadgeDefUpdate,
	onMedalDefDelete,
	onMedalDefUpdate,
} from './events/events';
import { assignResourceEntityPrivacyField } from '../util/privacy.helper';
@Injectable()
export class AchievementsDefService {
	constructor(
		@InjectModel(AchievementDef.name)
		private achievementDefModel: Model<AchievementDefDocument>,
		protected partnerResourceService: PartnerResourcesService,
		protected eventEmitter: EventEmitter2,
		protected computeMedals: ComputeMedalsService,
		protected computeBadges: ComputeBadgesService,
	) {}
	async getResourceMedalDefs({
		resource_id,
		...filter
	}: { resource_id: string } & FilterQuery<MedalDefDocument>) {
		const result = await this.achievementDefModel.find({
			resource_id,
			...filter,
			type: AchievementType.medal,
		});
		return result;
	}

	async getResourceBadgeDefs({
		resource_id,
		...filter
	}: { resource_id: string } & FilterQuery<BadgeDefDocument>) {
		return await this.achievementDefModel.find({
			resource_id,
			...filter,
			type: AchievementType.badge,
		});
	}

	async createBadgeDef(badge: CreateBadgeDefDto) {
		const resource = await this.partnerResourceService.get_resource(
			badge.resource_id,
		);
		const newBadge = new this.achievementDefModel({
			...badge,
			type: AchievementType.badge,
			resource_uri: resource.resource_uri,
		});
		assignResourceEntityPrivacyField(resource, newBadge);

		await this.computeBadges.computeBadges()

		return await newBadge.save();
	}

	async getbadgeDefs(
		badgeFilter: BadgeDefFilter,
		queryFilter: FilterQuery<BadgeDefDocument> = {},
	) {
		const filterQuery: FilterQuery<AchievementDef> = {
			...badgeFilter.omitPagination(),
			...queryFilter,
			type: AchievementType.badge,
		};
		const dataPromise = this.achievementDefModel.find(
			filterQuery,
			{},
			badgeFilter.getMongoQueryOptions(),
		);
		const countPromise = this.achievementDefModel.count(filterQuery);

		const [data, count] = await Promise.all([dataPromise, countPromise]);

		return {
			data,
			count,
		};
	}

	async updateBadgeDef(updateBadge: UpdateBadgeDefDto) {
		const { resource_id, name, ...updates } = updateBadge;
		const resource = await this.partnerResourceService.get_resource(
			resource_id,
		);

		updateBadge.league = updateBadge.league ?? resource.defaultLeague;

		const badge = await this.achievementDefModel.findOneAndUpdate(
			{
				resource_id,
				name,
				type: AchievementType.badge,
			},
			{
				$set: updates,
			},
			{ new: true },
		);

		await this.eventEmitter.emitAsync(onBadgeDefUpdate, {
			badgeDef: badge,
		} as IBadgeDefUpdateEventPayload);

		return badge;
	}

	async deleteBadgeDef(deleteBadge: DeleteBadgeDefDto) {
		const resource = await this.partnerResourceService.get_resource(
			deleteBadge.resource_id,
		);
		deleteBadge.league = deleteBadge.league ?? resource.defaultLeague;

		const delete_confirmation = await this.achievementDefModel.deleteOne({
			...deleteBadge,
			type: AchievementType.badge,
		});

		await this.eventEmitter.emitAsync(onBadgeDefDelete, {
			badgeDef: deleteBadge,
		} as IBadgeDefDeleteEventPayload);
		return delete_confirmation.deletedCount;
	}

	async createMedalDef(medal: CreateMedalDto) {
		const resource = await this.partnerResourceService.get_resource(
			medal.resource_id,
		);

		const newMedalDef = new this.achievementDefModel({
			...medal,
			type: AchievementType.medal,
			resource_uri: resource.resource_uri,
		});

		assignResourceEntityPrivacyField(resource, newMedalDef);

		return await newMedalDef.save();
	}

	async getMedalDefs(
		queryFilter: FilterQuery<MedalDefDocument> = {},
		options: QueryOptions<MedalDefDocument> = {},
	) {
		const filterQuery: FilterQuery<AchievementDef> = {
			...queryFilter,
			type: AchievementType.medal,
		};
		const data$ = this.achievementDefModel.find(filterQuery, {}, options);
		const count$ = this.achievementDefModel.count(filterQuery);

		const [data, count] = await Promise.all([data$, count$]);

		return {
			data,
			count,
		};
	}

	async updateMedalDef(medal_update: UpdateMedalDefDto) {
		const { resource_id, name, ...updates } = medal_update;

		const medal: AchievementDefDocument =
			await this.achievementDefModel.findOneAndUpdate(
				{
					type: AchievementType.medal,
					resource_id,
					name,
				},
				{
					$set: updates,
				},
				{
					new: true,
				},
			);

		await this.eventEmitter.emitAsync(onMedalDefUpdate, {
			medalDef: medal,
		} as IMedalDefUpdateEventPayload);

		return medal;
	}

	async deleteMedalDef(deleteMedal: DeleteMedalDefDto) {
		const resource = await this.partnerResourceService.get_resource(
			deleteMedal.resource_id,
		);

		deleteMedal.league = deleteMedal.league ?? resource.defaultLeague;
		const delete_confirmation = await this.achievementDefModel.deleteOne({
			...deleteMedal,
			type: AchievementType.medal,
		});

		await this.eventEmitter.emitAsync(onMedalDefDelete, {
			medalDef: deleteMedal,
		} as IMedalDefDeleteEventPayload);
		return delete_confirmation.deletedCount;
	}

	async count() {
		return await this.achievementDefModel.count();
	}

	async medalDefCount() {
		return await this.achievementDefModel.count({
			type: AchievementType.medal,
		});
	}
	async badgeDefCount() {
		return await this.achievementDefModel.count({
			type: AchievementType.badge,
		});
	}
}
