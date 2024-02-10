import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
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
	MedalsFilter,
	UpdateMedalDefDto,
} from './dto/medal-crud.dto';
import {
	AchievementDef,
	AchievementDefDocument,
} from '../core/schemas/achievement-def.schema';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ON_TERM_DELETED } from '../terms/constants';
import {
	ON_BADGE_DEF_DELETE,
	ON_BADGE_DEF_UPDATE,
	ON_MEDAL_DEF_DELETE,
	ON_MEDAL_DEF_UPDATE,
} from './constants';
@Injectable()
export class AchievementsDefService {
	constructor(
		@InjectModel(AchievementDef.name)
		private achievementDefModel: Model<AchievementDefDocument>,
		protected partnerResourceService: PartnerResourcesService,
		protected eventEmitter: EventEmitter2,
	) {}
	async getResourceMedalDefs(resource_id?: string, resource_uri?: string) {
		if (resource_uri || resource_id) {
			const result = await this.achievementDefModel.find({
				$or: [{ resource_uri }, { resource_id }],
				type: 'medal',
			});
			return result;
		}
		return await this.achievementDefModel.find({ type: 'medal' });
	}

	async getResourceBadgeDefs(resource_id?: string, resource_uri?: string) {
		if (resource_uri || resource_id) {
			return await this.achievementDefModel.find({
				$or: [{ resource_uri }, { resource_id }],
				type: 'badge',
			});
		}
		return await this.achievementDefModel.find({ type: 'badge' });
	}

	async createBadgeDef(badge: CreateBadgeDefDto) {
		const newBadge = new this.achievementDefModel({
			...badge,
			type: 'badge',
			resource_uri: await this.partnerResourceService.retrieve_uri(
				badge.resource_id,
			),
		});

		return await newBadge.save();
	}

	async getbadgeDefs(badgeFilter: BadgeDefFilter) {
		const filterQuery: FilterQuery<AchievementDef> = {
			...badgeFilter.omitPagination(),
			type: 'badge',
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

	async updateBadgeDef(badge_update: UpdateBadgeDefDto) {
		const { resource_id, name, ...updates } = badge_update;
		await this.achievementDefModel.updateOne(
			{
				resource_id,
				name,
				type: 'badge',
			},
			updates,
		);
		const badge = await this.achievementDefModel.findOne({
			resource_id,
			name,
			type: 'badge',
		});

		await this.eventEmitter.emitAsync(ON_BADGE_DEF_UPDATE, badge);

		return badge;
	}

	async deleteBadgeDef(delete_badge: DeleteBadgeDefDto) {
		const delete_confirmation = await this.achievementDefModel.deleteOne({
			...delete_badge,
			type: 'badge',
		});

		await this.eventEmitter.emitAsync(ON_BADGE_DEF_DELETE, delete_badge);
		return delete_confirmation.deletedCount;
	}

	async createMedalDef(medal: CreateMedalDto) {
		const newMedal = new this.achievementDefModel({
			...medal,
			type: 'medal',
			resource_uri: await this.partnerResourceService.retrieve_uri(
				medal.resource_id,
			),
		});

		return await newMedal.save();
	}

	async getMedalDefs(medalFilter: MedalsFilter) {
		const filter = medalFilter.omitPagination();
		const filterQuery: FilterQuery<AchievementDef> = {
			...filter,
			type: 'medal',
		};
		const dataPromise = this.achievementDefModel.find(
			filterQuery,
			{},
			medalFilter.getMongoQueryOptions(),
		);
		const countPromise = this.achievementDefModel.count(filterQuery);

		const [data, count] = await Promise.all([dataPromise, countPromise]);

		return {
			data,
			count,
		};
	}

	async updateMedalDef(medal_update: UpdateMedalDefDto) {
		const { resource_id, name, ...updates } = medal_update;
		await this.achievementDefModel.updateOne(
			{
				type: 'medal',
				resource_id,
				name,
			},
			updates,
		);

		const medal = await this.achievementDefModel.findOne({
			resource_id,
			name,
			type: 'medal',
		});

		await this.eventEmitter.emitAsync(ON_MEDAL_DEF_UPDATE, medal);

		return medal;
	}

	async deleteMedalDef(delete_medal: DeleteMedalDefDto) {
		const delete_confirmation = await this.achievementDefModel.deleteOne({
			...delete_medal,
			type: 'medal',
		});

		await this.eventEmitter.emitAsync(ON_MEDAL_DEF_DELETE, delete_medal);
		return delete_confirmation.deletedCount;
	}

	// @OnEvent(ON_TERM_DELETED, { async: true })
	// async removeTermFromAchievements({
	// 	resource_id,
	// 	activity_term,
	// }: {
	// 	resource_id: string;
	// 	activity_term: string;
	// }) {
	// 	return await this.achievementDefModel.updateMany(
	// 		{
	// 			resource_id,
	// 			list_terms: activity_term,
	// 		},
	// 		{
	// 			$pull: { list_terms: activity_term },
	// 		},
	// 	);
	// }

	async count() {
		return await this.achievementDefModel.count();
	}

	async medalDefCount() {
		return await this.achievementDefModel.count({ type: 'medal' });
	}
	async badgeDefCount() {
		return await this.achievementDefModel.count({ type: 'badge' });
	}
}
