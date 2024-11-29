import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, QueryOptions } from 'mongoose';
import { User } from '../core/schemas/user.schema';
import {
	Statistics,
	StatisticsDocument,
} from '../core/schemas/statistics.schema';
import { PartnerResourcesService } from '../resources/partner-resources/services/partner-resources.service';
import { GetStatisticsDto } from './dto/get-statistics.dto';
import { plainToClass, plainToInstance } from 'class-transformer';
import { StatisticsDto, StatLeaderboardDto } from './dto/statistics.dto';
import { userResourceEntityPrivacyFilter } from '../util/privacy.helper';
import { UserRepository } from '../core/repositories/user.repository';

@Injectable()
export class StatisticsService {
	constructor(
		@InjectModel(Statistics.name)
		protected statisticsModel: Model<StatisticsDocument>,
		protected userRepository: UserRepository,
		protected partnerResourceService: PartnerResourcesService,
	) {}

	logger = new Logger(StatisticsService.name);

	async get_all_statistics(
		getStatDto: GetStatisticsDto,
		filter: FilterQuery<StatisticsDocument>,
	) {
		const {
			resources: resource_ids,
			query: passed_query,
			filter_field: user_filter_field,
		} = getStatDto;

		// query filter
		const mongoQuery: FilterQuery<StatisticsDocument> = {};

		// if there's a query passed
		if (passed_query) {
			// if there's no user_filter_field, default to displayedName
			const field = !!user_filter_field ? user_filter_field : 'displayedName';
			// pass query using regex, case insensitive
			mongoQuery[field] = { $regex: passed_query, $options: 'i' };
		}

		if (resource_ids) {
			mongoQuery['stats.resource_id'] = { $in: resource_ids };
		}

		const projectUserFields = {
			role: 0,
			_id: 0,
			__v: 0,
			last_update: 0,
			orcid_permission: 0,
			cookie_token: 0,
			resource_settings: 0,
			refresh_token: 0,
			resources: 0,
			orcid_scope: 0,
			orcid_work_put_codes: 0,
		};

		const userFieldsGroupStageFields = {
			avatar: { $first: '$avatar' },
			orcid_id: { $first: '$orcid_id' },
			displayedName: { $first: '$displayedName' },
			biography: { $first: '$biography' },
		};

		// add privacy fitlers to mongoQuery

		const matchFilter: FilterQuery<StatisticsDocument> = {
			$and: [mongoQuery, filter],
		};

		const userStatsAggregation = [
			{
				// remove fields we don't need
				$project: projectUserFields,
			},
			{
				// join with statistics
				$lookup: {
					from: 'statistics',
					localField: 'orcid_id',
					foreignField: 'curator_orcid',
					as: 'stats',
				},
			},
			{
				$unwind: {
					path: '$stats',
					preserveNullAndEmptyArrays: false,
				},
			},
			{
				$match: matchFilter,
			},
			{
				$group: {
					_id: '$orcid_id',
					...userFieldsGroupStageFields,
					stats: {
						$addToSet: '$stats',
					},
				},
			},
			{
				$project: {
					'stats.generation_terms': 0,
					'stats.invalidation_terms': 0,
					'stats.revision_terms': 0,
				},
			},
		];

		// sort aggregation
		const sortAggregation = [];
		if (!!getStatDto.sortBy && !!getStatDto.sortOrder) {
			const obj = { $sort: {} };
			// if the field belongs  to userFields it is directly used, otherwise it belongs to the
			// statistics field and we append "stats."
			const sortField = Object.keys(userFieldsGroupStageFields).includes(
				getStatDto.sortBy,
			)
				? getStatDto.sortBy
				: 'stats.' + getStatDto.sortBy;
			obj.$sort[sortField] = getStatDto.sortOrder;
			sortAggregation.push(obj);
		}

		// get the data aggregated
		const dataPromise = this.userRepository.aggregate([
			...userStatsAggregation,
			...sortAggregation,
			...getStatDto.getMongoAggregation(),
		]);

		const countPromise = this.userRepository.aggregate<{ total_count: number }>(
			[...userStatsAggregation, { $count: 'total_count' }],
		);

		const [data, aggregation_count] = await Promise.all([
			dataPromise,
			countPromise,
		]);

		// aggregation returns array containing object with attribute 'total_count',
		// extracting the count if available, otherwise it's an empty list and therefore 0
		const count = aggregation_count?.[0]?.total_count || 0;

		return { data, count };
	}

	async getResourceLeaderboard(
		filter: FilterQuery<StatisticsDocument> & { resource_id: string },
		options: QueryOptions<StatisticsDocument>,
	): Promise<{ data: StatLeaderboardDto[]; count: number }> {
		const resource = await this.partnerResourceService.get_resource(
			filter.resource_id,
		);
		if (!resource) {
			throw new NotFoundException(
				`Resource ${filter.resource_id} does not Exist`,
			);
		}

		const leaderboard = await this.statisticsModel.find(
			filter,
			{ generation_terms: 0, invalidation_terms: 0, revision_terms: 0 },
			{ ...options, sort: { total_score: -1 } },
		);

		const orcid_ids = leaderboard.map((stat) => stat.curator_orcid);

		const users = await this.userRepository.find({
			orcid_id: { $in: orcid_ids },
		});

		const data = leaderboard.map((stat) => {
			const user = users.find((u) => u.orcid_id === stat.curator_orcid);
			const leaderboardEntry = {
				stat: stat.toObject(),
				user: user ? user.toObject() : null,
			};

			return plainToClass(StatLeaderboardDto, leaderboardEntry, {
				excludeExtraneousValues: true,
			});
		});

		const count = await this.statisticsModel.count(filter);
		return {
			data,
			count,
		};
	}

	/**
	 *
	 * @param filter Dto Object that Filters Statistics
	 * @param allowedResources A list of resource ids on which the privacy restriction doesn't apply
	 * @param defaultPrivacy The default privacy requested
	 * @returns {Statistics[]} A list of statistics fitting the filter criteria
	 */
	async getUserStatistics(
		filter: FilterQuery<StatisticsDocument>,
		options: QueryOptions<StatisticsDocument>,
	) {
		return await this.statisticsModel.find(
			filter,
			{
				generation_terms: 0,
				invalidation_terms: 0,
				revision_terms: 0,
			},
			options,
		);
	}

	/**
	 * Retrieves the statistics for a specific resource and user.
	 *
	 * @param resource_id - The ID of the resource.
	 * @param curator_orcid - The ORCID of the curator.
	 * @param user - Optional. The user object.
	 * @returns A promise that resolves to an array of StatisticsDto objects.
	 */
	async getResourceUserStatistics(
		resource_id: string,
		curator_orcid: string,
		user?: User,
	): Promise<StatisticsDto[]> {
		const privacyFilter = userResourceEntityPrivacyFilter(user);

		const filter = {
			$and: [{ resource_id, curator_orcid }, privacyFilter],
		};

		const stats = await this.statisticsModel.find(filter);

		const serializedStats = plainToInstance(StatisticsDto, stats, {
			excludeExtraneousValues: true,
			enableCircularCheck: true,
		});

		return serializedStats;
	}
}
