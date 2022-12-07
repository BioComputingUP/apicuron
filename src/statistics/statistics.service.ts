import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { TransformerService } from '../shared/transformer/transformer.service';
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
		protected transformerService: TransformerService,
	) { }

	logger = new Logger(StatisticsService.name);

	async get_user_statistics(curator_orcid: string) {
		return await this.statisticsModel.find({
			curator_orcid
		})
	}

	async get_all_statistics(
		user_query?: string,
		user_filter_field?: string,
		resource_ids?: string[],
		page: number = 1,
		page_size: number = 10,
	) {
		const skip = (page - 1) * page_size;
		let query = {};
		if (user_query) {
			console.log('here')
			const field = !!user_filter_field ? user_filter_field : 'displayedName';
			query[field] = { $regex: user_query, $options: 'i' };
		}

		if (resource_ids) {
			const resource_uris = (await this.partnerResourceService.get_resources())
				.filter((x) => resource_ids.includes(x.resource_id))
				.map(({ resource_uri }) => resource_uri);
			if (resource_ids.length != resource_uris.length) {
				// warning some resource_ids were wrong
				this.transformerService.warn(
					'resources',
					`requested these resource_ids [${resource_ids}] but ${resource_ids.length - resource_ids.length
					} of them are wrong`,
				);
			}
			if (resource_uris && resource_uris.length > 0) {
				query = { ...query, 'stats.resource_uri': { $in: resource_uris } };
			}
		}

		console.log(query)

		const userStatsAggregation  = [
			{
				$project: {
					role: 0,
					__v: 0,
					last_update: 0
				}
			},
			{
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

		const dataPromise = this.userModel.aggregate([...userStatsAggregation, ...paginationAggregation])
		
		const countPromise = this.userModel.aggregate([...userStatsAggregation, { $count: 'total_count'}] )

		const [data, count] = await Promise.all([dataPromise, countPromise]);
		return { data, count, page, page_size };
	}

	async get_resource_leaderboard(
		resource_id: string,
		page: number = 1,
		page_size: number = 10,
	) {
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
