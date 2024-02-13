import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage, QueryOptions } from 'mongoose';
import { User, UserDocument, UserSchema } from '../core/schemas/user.schema';
import {
	Statistics,
	StatisticsDocument,
} from '../core/schemas/statistics.schema';
import { PartnerResourcesService } from '..//resources/partner-resources/partner-resources.service';
import { GetStatisticsDto } from './dto/get-statistics.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { UPDATE_USER_PRIVACY } from './constants';
import { PublicStatistics } from './schema/public-statistics.schema';

@Injectable()
export class StatisticsService {
	constructor(
		@InjectModel(Statistics.name)
		protected statisticsModel: Model<StatisticsDocument>,
		@InjectModel(User.name) protected userModel: Model<UserDocument>,
		protected partnerResourceService: PartnerResourcesService,
	) {}

	logger = new Logger(StatisticsService.name);

	@OnEvent(UPDATE_USER_PRIVACY, { async: true, promisify: true })
	async setUserStatsPrivacy({
		orcid_id,
		privacy,
	}: {
		orcid_id: string;
		privacy: 'public' | 'private';
	}) {
		this.logger.log(
			`Handling Update user stat privacy event in statistics service ${orcid_id} ${privacy} !`,
		);

		const result = await this.statisticsModel.updateMany(
			{
				curator_orcid: orcid_id,
			},
			{
				$set: {
					activityClass: {
						privacy,
					},
				},
			},
			{
				overwriteDiscriminatorKey: true,
			},
		);

		this.logger.log(result);
		return result;
	}

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
			refresh_token: 0,
			resources: 0,
			orcid_scope: 0,
			orcid_work_put_codes: 0,
		};
		const userFieldsToRemove = Object.keys(projectUserFields);

		const userFieldsGroupStage = Object.keys(UserSchema.paths)
			.filter((key) => !userFieldsToRemove.includes(key))
			.reduce((obj, key) => ({ ...obj, [key]: { $first: '$' + key } }), {});

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
					...userFieldsGroupStage,
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
			const sortField = Object.keys(userFieldsGroupStage).includes(
				getStatDto.sortBy,
			)
				? getStatDto.sortBy
				: 'stats.' + getStatDto.sortBy;
			obj.$sort[sortField] = getStatDto.sortOrder;
			sortAggregation.push(obj);
		}

		// get the data aggregated
		const dataPromise = this.userModel.aggregate([
			...userStatsAggregation,
			...sortAggregation,
			...getStatDto.getMongoAggregation(),
		]);

		const countPromise = this.userModel.aggregate([
			...userStatsAggregation,
			{ $count: 'total_count' },
		]);

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
	) {
		const resource = await this.partnerResourceService.get_resource(
			filter.resource_id,
		);
		if (!resource) {
			throw new NotFoundException(
				`Resource ${filter.resource_id} does not Exist`,
			);
		}

		const leaderboardPromise = this.statisticsModel.find(
			filter,
			{ generation_terms: 0, invalidation_terms: 0, revision_terms: 0 },
			{ ...options, sort: { total_score: -1 } },
		);

		const countPromise = this.statisticsModel.count(filter);
		const [data, count] = await Promise.all([leaderboardPromise, countPromise]);
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
	async getStatistics(
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
}
