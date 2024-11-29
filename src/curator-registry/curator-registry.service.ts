import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import {
	CuratorRegistryEntry,
	CuratorRegistryEntryDocument,
} from 'src/core/schemas/curator-registry/curator-entry.schema';
import { PartnerResourcesService } from 'src/resources/partner-resources/services/partner-resources.service';
import { RegistryEntriesDto } from './dto/registry-entries.dto';
// import { User, UserDocument } from 'src/core/schemas/user.schema';
import { UserRepository } from 'src/core/repositories/user.repository';
import { Report, ReportDocument } from 'src/core/schemas/reports.schema';
@Injectable()
export class CuratorRegistryService {
	constructor(
		@InjectModel(CuratorRegistryEntry.name)
		protected curatorEntryModel: Model<CuratorRegistryEntryDocument>,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
		protected userRep: UserRepository,
		protected resourceService: PartnerResourcesService,
	) {}
	logger = new Logger(CuratorRegistryService.name);

	/**
	 * Get all curators from registry that match the user filter query
	 * @param query : user query
	 */
	async getAllEntries(
		query: RegistryEntriesDto,
		// filter?: FilterQuery<CuratorEntryDocument>
	) {
		// TODO: Add pagination
		//extract user query details
		const {
			filter_field: filtered_field, //orcid or displayed name
			query: user_query, // what the user typed in the first filed
			resources: filtered_resources, // the resource list filtererd by the user
		} = query;

		//build query filter
		const query_filter: FilterQuery<CuratorRegistryEntryDocument> = {};

		// Search for what the user typed if it's not empty
		if (!!user_query)
			query_filter[filtered_field] = { $regex: user_query, $options: 'i' };

		//searched the
		if (!!filtered_resources) {
			query_filter['contributed_to'] = {
				$elemMatch: { resource_id: { $in: filtered_resources } },
			};
		}
		// hide sensitive and unimportant curator fields
		const user_fields_projection = {
			'curator.role': 0,
			'curator._id': 0,
			'curator.__v': 0,
			'curator.last_update': 0,
			'curator.orcid_permission': 0,
			'curator.cookie_token': 0,
			'curator.resource_settings': 0,
			'curator.refresh_token': 0,
			'curator.resources': 0,
			'curator.orcid_scope': 0,
			'curator.orcid_work_put_codes': 0,
		};
		const aggregation_pipeline = [
			{ $match: { ...query_filter } }, // apply user filter
			{ $project: { ...user_fields_projection } }, // project out user fields
		];

		try {
			const entries = await this.curatorEntryModel.aggregate(
				aggregation_pipeline,
			);
			return entries;
		} catch (error) {
			this.logger.error('Error while getting information about all users...');
			this.logger.error(error);
		}
	}

	async updateCuratorEntry(orcid_identifier: string) {
		//check if user exists
		let user = null;
		try {
			user = await this.userRep.findOne({ orcid_id: orcid_identifier });
		} catch (error) {
			this.logger.error(
				`Could not retrieve user with orcid: ${orcid_identifier}...`,
			);
			this.logger.error(error);
		}
		// if user exists
		if (!!user) {
			// const resource_ids = await this.reportModel.distinct('resource_id', {
			// 	curator_orcid: orcid_identifier,
			// });

			const aggregation_pipeline = [
				{
					$match: {
						curator_orcid: orcid_identifier,
					},
				},
				{
					$group: {
						_id: 'example_resource',
						leagues: { $addToSet: '$league' },
					},
				},
				{
					$lookup: {
						from: 'resources_def',
						localField: '_id',
						foreignField: 'resource_id',
						as: 'resources',
					},
				},
				{
					$unwind: '$resources',
				},
				{
					$project:{
						"_id": 0, 

					}
				}
			];
		}
	}
}
