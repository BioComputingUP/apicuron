import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
// import { TransformerService } from '../shared/transformer/transformer.service';
import { User, UserDocument, UserSchema } from '../auth/users/schemas/user.schema';
import { Statistics, StatisticsDocument } from './schemas/statistics.schema';
import { PartnerResourcesService } from '..//resources/partner-resources/partner-resources.service';

@Injectable()
export class StatisticsService {
	constructor(
		@InjectModel(Statistics.name)
		protected statisticsModel: Model<StatisticsDocument>,
		@InjectModel(User.name) protected userModel: Model<UserDocument>,
		protected partnerResourceService: PartnerResourcesService,
	) { }

	logger = new Logger(StatisticsService.name);

	async get_public_user_statistics(curator_orcid: string) {
		if (await this.userModel.exists({ orcid_id: curator_orcid })) {
			return await this.statisticsModel.find({
				curator_orcid
			})
		} else {
			throw new NotFoundException('User not found');
		}
	}

	async get_all_user_statistics(curator_orcid: string, resource_ids: string[] = []) {
		return await this.statisticsModel.find({
			curator_orcid,
			resource_id: { $in: resource_ids }
		})
	}

	async get_all_statistics(
		passed_query?: string,
		user_filter_field?: string,
		resource_ids?: string[],
		page: number = 1,
		page_size: number = 10,
	) {
		// setup pagination
		const skip = (page - 1) * page_size;

		// query filter
		let query = {};
		// if there's a query passed
		if (passed_query) {
			// if there's no user_filter_field, default to displayedName
			const field = !!user_filter_field ? user_filter_field : 'displayedName';
			// pass query using regex, case insensitive
			query[field] = { $regex: passed_query, $options: 'i' };
		}

		if (resource_ids) {
			// for backwards compatibility obtain resource_uris and add them in query
			const resource_uris = (await this.partnerResourceService.get_resources())
				.filter((x) => resource_ids.includes(x.resource_id))
				.map(({ resource_uri }) => resource_uri);

			if (resource_uris && resource_uris.length > 0) {
				query = { 
					...query,
					$or: [
						// get both stats matching resource_uris and resource_ids
						{
							'stats.resource_uri': { 
								$in: resource_uris 
							}
						},
						{
							'stats.resource_id': {
								$in: resource_ids
							}
						}
					]
					 
				};
			}
		}


		const userStatsAggregation = [
			{
				// remove fields we don't need
				$project: {
					role: 0,
					__v: 0,
					last_update: 0
				}
			},
			{	// join with statistics
				"$lookup": {
					from: "statistics",
					localField: "orcid_id",
					foreignField: "curator_orcid",
					as: "stats"
				}
			},
			{
				"$match": query
			},

		]
		const paginationAggregation = [
			{
				"$skip": skip
			},
			{
				'$limit': +page_size
			}
		]

		// get the data aggregated
		const dataPromise = this.userModel.aggregate([...userStatsAggregation, ...paginationAggregation])

		const countPromise = this.userModel.aggregate([...userStatsAggregation, { $count: 'total_count' }])

		const [data, aggregation_count] = await Promise.all([dataPromise, countPromise]);

		// aggregation returns array containing object with attribute 'total_count', 
		// extracting the count if available, otherwise it's an empty list and therefore 0
		const count = aggregation_count?.[0]?.total_count || 0

		return { data, count, page, page_size };
	}

	async get_resource_leaderboard(
		resource_id: string,
		page: number = 1,
		page_size: number = 10,
	) {
		page = 1;
		const resource = await this.partnerResourceService.get_resource(
			resource_id,
		);
		if (!resource) {
			throw new NotFoundException(`Resource ${resource_id} does not Exist`);
		}
		const skip = (page - 1) * page_size;

		const leaderboardPromise = this.statisticsModel.aggregate([
			// get the users with the corresponding resource_id
			{
				$match: {
					resource_id,
				},
			},
			// sort by the total score
			{
				$sort: {
					'total_score': -1,
				},
			},
			{
				$skip: skip,
			},
			{
				$limit: page_size,
			},
		]);


		const query = { resource_id };
		const countPromise = this.statisticsModel.count(query);
		const [leaderboard, count] = await Promise.all([leaderboardPromise, countPromise])
		return { data: leaderboard, page, count };
	}
}
