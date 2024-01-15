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
	DeleteMedalDto,
	MedalsFilter,
	UpdateMedalDto,
} from './dto/medal-crud.dto';
import {
	AchievementDef,
	AchievementDefDocument,
} from '../core/schemas/achievement-def.schema';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { TERM_DELETED } from '../terms/constants';
import { ON_BADGE_DELETE, ON_MEDAL_DELETE } from './constants';
@Injectable()
export class AchievementsDefService {
	constructor(
		@InjectModel(AchievementDef.name)
		private achievementDefModel: Model<AchievementDefDocument>,
		protected partnerResourceService: PartnerResourcesService,
		protected eventEmitter: EventEmitter2,
	) {}
	async get_resource_medals(resource_id?: string, resource_uri?: string) {
		if (resource_uri || resource_id) {
			const result = await this.achievementDefModel.find({
				$or: [{ resource_uri }, { resource_id }],
				type: 'medal',
			});
			return result;
		}
		return await this.achievementDefModel.find({ type: 'medal' });
	}

	async get_resource_badges(resource_id?: string, resource_uri?: string) {
		if (resource_uri || resource_id) {
			return await this.achievementDefModel.find({
				$or: [{ resource_uri }, { resource_id }],
				type: 'badge',
			});
		}
		return await this.achievementDefModel.find({ type: 'badge' });
	}

	async create_badge(badge: CreateBadgeDefDto) {
		const newBadge = new this.achievementDefModel({
			...badge,
			type: 'badge',
			resource_uri: await this.partnerResourceService.retrieve_uri(
				badge.resource_id,
			),
		});

		return await newBadge.save();
	}

	async get_badges(badgeFilter: BadgeDefFilter) {
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

	async update_badge(badge_update: UpdateBadgeDefDto) {
		const { resource_id, name, ...updates } = badge_update;
		await this.achievementDefModel.updateOne(
			{
				resource_id,
				name,
				type: 'badge',
			},
			updates,
		);
		return await this.achievementDefModel.findOne({
			resource_id,
			name,
			type: 'badge',
		});
	}

	async delete_badge(delete_badge: DeleteBadgeDefDto) {
		const delete_confirmation = await this.achievementDefModel.deleteOne({
			...delete_badge,
			type: 'badge',
		});

		await this.eventEmitter.emitAsync(ON_BADGE_DELETE, delete_badge);
		return delete_confirmation.deletedCount;
	}

	async create_medal(medal: CreateMedalDto) {
		const newMedal = new this.achievementDefModel({
			...medal,
			type: 'medal',
			resource_uri: await this.partnerResourceService.retrieve_uri(
				medal.resource_id,
			),
		});

		return await newMedal.save();
	}

	async get_medals(medalFilter: MedalsFilter) {
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

	async update_medal(medal_update: UpdateMedalDto) {
		const { resource_id, name, ...updates } = medal_update;
		await this.achievementDefModel.updateOne(
			{
				type: 'medal',
				resource_id,
				name,
			},
			updates,
		);

		return await this.achievementDefModel.findOne({
			resource_id,
			name,
			type: 'medal',
		});
	}

	async delete_medal(delete_medal: DeleteMedalDto) {
		const delete_confirmation = await this.achievementDefModel.deleteOne({
			...delete_medal,
			type: 'medal',
		});

		await this.eventEmitter.emitAsync(ON_MEDAL_DELETE, delete_medal);
		return delete_confirmation.deletedCount;
	}

	@OnEvent(TERM_DELETED, { async: true })
	async removeTermFromAchievements({
		resource_id,
		activity_term,
	}: {
		resource_id: string;
		activity_term: string;
	}) {
		return await this.achievementDefModel.updateMany(
			{
				resource_id,
				list_terms: activity_term,
			},
			{
				$pull: { list_terms: activity_term },
			},
		);
	}

	async count() {
		return await this.achievementDefModel.count();
	}

	async medal_count() {
		return await this.achievementDefModel.count({ type: 'medal' });
	}
	async badges_count() {
		return await this.achievementDefModel.count({ type: 'badge' });
	}
}
