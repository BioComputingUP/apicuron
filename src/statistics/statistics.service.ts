import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
// import { TransformerService } from '../shared/transformer/transformer.service';
import { User, UserDocument, UserSchema } from '../core/schemas/user.schema';
import {
	PublicStatistics,
	Statistics,
	StatisticsDocument,
} from '../core/schemas/statistics.schema';
import { PartnerResourcesService } from '..//resources/partner-resources/partner-resources.service';
import { GetStatisticsDto } from './dto/get-statistics.dto';
import { paginate } from '../pagination/paginator';
import { PaginateDto } from '../pagination/dto/paginate.dto';
import { ReportDocument } from '../core/schemas/reports.schema';
import { OnEvent } from '@nestjs/event-emitter';
import { UPDATE_USER_PRIVACY } from './constants';
import { StatisticsFilter } from './dto/statistics-filter.dto';

@Injectable()
export class StatisticsService {
	constructor(
		@InjectModel(Statistics.name)
		protected statisticsModel: Model<StatisticsDocument>,
		@InjectModel(PublicStatistics.name)
		protected publicStatModel: Model<PublicStatistics>,
		@InjectModel(User.name) protected userModel: Model<UserDocument>,
		protected partnerResourceService: PartnerResourcesService,
	) {}

	logger = new Logger(StatisticsService.name);

	@OnEvent(UPDATE_USER_PRIVACY, { async: true })
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
					privacy,
				},
			},
			{
				overwriteDiscriminatorKey: true,
			},
		);

		this.logger.log(result);
		return result;
	}

	async get_public_user_statistics(curator_orcid: string) {
		if (await this.userModel.exists({ orcid_id: curator_orcid })) {
			return await this.statisticsModel.find({
				curator_orcid,
				privacy: 'public',
			});
		} else {
			throw new NotFoundException('User not found');
		}
	}

	async get_all_user_statistics(
		curator_orcid: string,
		resource_ids: string[] = [],
		privacy: any = 'public',
	) {
		const query = {
			curator_orcid,
			privacy,
		};
		if (resource_ids) {
			query['resource_id'] = { $in: resource_ids };
		}
		return await this.statisticsModel.find(query);
	}

	async get_all_statistics(
		getStatDto: GetStatisticsDto,
		allowedResources: string[] = [],
		request_orcid: string | null = null,
		privacy: 'public' | 'private' = 'public',
	) {
		const {
			resources: resource_ids,
			query: passed_query,
			filter_field: user_filter_field,
		} = getStatDto;

		const privacyFilters: FilterQuery<any>[] = [
			// Either get the statistics from allowed Resources (meaning resources without private or public restrictions)
			{
				'stats.resource_id': {
					$in: allowedResources,
				},
			},
			{
				// Or only get the stats with the specified privacy (default: public)
				'stats.privacy': privacy,
			},
		];

		if (!!request_orcid) {
			privacyFilters.push({
				'stats.curator_orcid': request_orcid,
			});
		}

		// query filter
		const mongoQuery: FilterQuery<any> = {
			$and: [
				{
					$or: privacyFilters,
				},
			],
		};

		// if there's a query passed
		if (passed_query) {
			// if there's no user_filter_field, default to displayedName
			const field = !!user_filter_field ? user_filter_field : 'displayedName';
			// pass query using regex, case insensitive
			mongoQuery[field] = { $regex: passed_query, $options: 'i' };
		}

		if (resource_ids) {
			// for backwards compatibility obtain resource_uris and add them in query
			const resource_uris = (await this.partnerResourceService.get_resources())
				.filter((x) => resource_ids.includes(x.resource_id))
				.map(({ resource_uri }) => resource_uri);

			if (resource_uris && resource_uris.length > 0) {
				mongoQuery['$and'].push({
					$or: [
						{
							'stats.resource_id': { $in: resource_ids },
						},
						{
							'stats.resource_uri': { $in: resource_uris },
						},
					],
				});
			} else {
				mongoQuery['$and'].push({
					'stats.resource_id': { $in: resource_ids },
				});
			}
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
				$match: mongoQuery,
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

		return paginate(data, getStatDto, count);
	}

	async getResourceLeaderboard(resource_id: string, pagination: PaginateDto) {
		const resource = await this.partnerResourceService.get_resource(
			resource_id,
		);
		if (!resource) {
			throw new NotFoundException(`Resource ${resource_id} does not Exist`);
		}

		const leaderboardPromise = this.statisticsModel.find(
			{
				resource_id,
			},
			{ generation_terms: 0, invalidation_terms: 0, revision_terms: 0 },
			{ ...pagination.getMongoQueryOptions(), sort: { total_score: -1 } },
		);

		const query = { resource_id };
		const countPromise = this.statisticsModel.count(query);
		const [leaderboard, count] = await Promise.all([
			leaderboardPromise,
			countPromise,
		]);
		return paginate(leaderboard, pagination, count);
	}

	async getPublicResourceLeaderboard(
		resource_id: string,
		pagination: PaginateDto,
	) {
		const data = await this.publicStatModel.find(
			{ resource_id },
			{ generation_terms: 0, invalidation_terms: 0, revision_terms: 0 },
			{ ...pagination.getMongoQueryOptions(), sort: { total_score: -1 } },
		);
		const count = await this.publicStatModel.count({ resource_id });

		return paginate(data, pagination, count);
	}

	/**
	 *
	 * @param filter Dto Object that Filters Statistics
	 * @param allowedResources A list of resource ids on which the privacy restriction doesn't apply
	 * @param defaultPrivacy The default privacy requested
	 * @returns {Statistics[]} A list of statistics fitting the filter criteria
	 */
	async getStatistics(
		filter: StatisticsFilter,
		allowedResources: string[] = [],
		request_orcid: string | null = null,
		defaultPrivacy: 'private' | 'public' = 'public',
	) {
		const privacyFilter: any = [
			{
				resource_id: { $in: allowedResources },
			},
			{
				privacy: defaultPrivacy,
			},
		];
		if (request_orcid) {
			privacyFilter.push({
				curator_orcid: request_orcid,
			});
		}
		return await this.statisticsModel.find(
			{
				...filter.omitPagination(),
				$or: privacyFilter,
			},
			{
				generation_terms: 0,
				invalidation_terms: 0,
				revision_terms: 0,
			},
			filter.getMongoQueryOptions(),
		);
	}
}
