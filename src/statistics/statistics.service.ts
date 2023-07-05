import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
// import { TransformerService } from '../shared/transformer/transformer.service';
import { User, UserDocument, UserSchema } from '../auth/users/schemas/user.schema';
import { Statistics, StatisticsDocument } from './schemas/statistics.schema';
import { PartnerResourcesService } from '..//resources/partner-resources/partner-resources.service';
import { GetStatisticsDto } from './dto/get-statistics.dto';
import { paginate } from '../pagination/paginator';
import { PaginateDto } from '../pagination/dto/paginate.dto';

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

	async get_all_statistics(getStatDto: GetStatisticsDto) {		
		const { resources: resource_ids, query: passed_query, filter_field: user_filter_field } = getStatDto


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

		// get the data aggregated
		const dataPromise = this.userModel.aggregate([...userStatsAggregation, ...getStatDto.getMongoAggregation()])

		const countPromise = this.userModel.aggregate([...userStatsAggregation, { $count: 'total_count' }])

		const [data, aggregation_count] = await Promise.all([dataPromise, countPromise]);

		// aggregation returns array containing object with attribute 'total_count', 
		// extracting the count if available, otherwise it's an empty list and therefore 0
		const count = aggregation_count?.[0]?.total_count || 0

		return paginate(data, getStatDto, count)
	}

	async getResourceLeaderboard(
		resource_id: string,
		pagination: PaginateDto
	) {
		const resource = await this.partnerResourceService.get_resource(
			resource_id,
		);
		if (!resource) {
			throw new NotFoundException(`Resource ${resource_id} does not Exist`);
		}

		const leaderboardPromise = this.statisticsModel.aggregate([
			// get the users with the corresponding resource_id
			{
				$match: {
					resource_id,
				},
			},
			{
				$lookup: {
					from: 'users',
					localField: 'curator_orcid',
					foreignField: 'orcid_id',
					as: 'user'
				}
			},
			{
				$unwind: {
					path: '$user'
				}
			},
			{
				$match: {
					user: { $exists: true }
				}
			},
			{
				$project: {
					user: 0
				}
			},
			// sort by the total score
			{
				$sort: {
					'total_score': -1,
				},
			},
			...pagination.getMongoAggregation()
		]);


		const query = { resource_id };
		const countPromise = this.statisticsModel.count(query);
		const [leaderboard, count] = await Promise.all([leaderboardPromise, countPromise])
		return paginate(leaderboard, pagination, count)
	}
}
