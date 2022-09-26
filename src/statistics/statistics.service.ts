import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TransformerService } from '../global/transformer/transformer.service';
import { User, UserDocument, UserSchema } from '../auth/users/user.schema';
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
	) {}

	logger = new Logger(StatisticsService.name);

	async get_one() {
		return await this.statisticsModel.findOne().populate('user');
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
			const field = !!user_filter_field ? user_filter_field : 'full_name';
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
					`requested these resource_ids [${resource_ids}] but ${
						resource_ids.length - resource_ids.length
					} of them are wrong`,
				);
			}
			if (resource_uris && resource_uris.length > 0) {
				query = { ...query, 'stats.resource_uri': { $in: resource_uris } };
			}
		}

		const dataPromise = this.userModel.find(query).skip(skip).limit(page_size);
		const countPromise = this.userModel.count(query);

		const [data, count] = await Promise.all([dataPromise, countPromise]);
		return { data, count, page, page_size };
	}

	async get_resource_leaderboard(
		resource_id: string,
		page: number = 1,
		page_size:number = 10,
	) {
		const resource = await this.partnerResourceService.get_resource(
			resource_id,
		);
		if (!resource) {
			throw new NotFoundException(`Resource ${resource_id} does not Exist`);
		}
		const skip = (page - 1) * page_size;

		const leaderboard = await this.userModel.aggregate([
			{
				$unwind: {
					path: '$stats',
				},
			},
			{
				$match: {
					'stats.resource_id': resource_id,
				},
			},
			{
				$sort: {
					'stats.total_score': -1,
				},
			},
			{
				$skip: skip,
			},
			{
				$limit: page_size,
			},
		]);

		const query = { 'stats.resource_id': resource_id };
		const count = await this.userModel.count(query);

		return { data:leaderboard, page, count };
	}
}
