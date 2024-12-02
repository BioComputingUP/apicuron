import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage } from 'mongoose';
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
		protected registryEntryModel: Model<CuratorRegistryEntryDocument>,
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
		if (!!user_query)
			query_filter[filtered_field] = { $regex: user_query, $options: 'i' };

		if (!!filtered_resources) {
			query_filter['contributed_to'] = {
				$elemMatch: { resource_id: { $in: filtered_resources } },
			};
		}
		const fields_to_hide = {
			// hide sensitive and unimportant curator fields
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
			// resource fields
			'contributed_to.resource._id': 0,
			"contributed_to.resource.leagues.updatedAt": 0,
			"contributed_to.resource.leagues.createdAt": 0,
			"contributed_to.resource.leagues._id": 0,
			__v: 0,
			_id: 0
		};
		const aggregation_pipeline = [
			{ $match: { ...query_filter } }, // apply user filter
			{ $project: { ...fields_to_hide } }, // project out user fields
		];
		this.logger.debug(aggregation_pipeline);
		try {
			const entries = await this.registryEntryModel.aggregate(
				aggregation_pipeline,
			);
			this.logger.debug(entries);
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

			const aggregation_pipeline: PipelineStage[] = [
				{
					//filter user reports
					$match: {
						curator_orcid: orcid_identifier,
					},
				},
				{
					// group by resource
					$group: {
						_id: '$resource_id',
						leagueNames: {
							$addToSet: '$league',
						},
					},
				},
				{
					// get the resource information
					$lookup: {
						from: 'resources_def',
						localField: '_id',
						foreignField: 'resource_id',
						as: 'resources',
					},
				},
				{
					$unwind: {
						path: '$resources',
					},
				},
				{
					// add league info
					$addFields: {
						leagues: {
							$filter: {
								input: '$resources.leagues',
								as: 'league',
								cond: {
									$in: ['$$league.name', '$leagueNames'],
								},
							},
						},
					},
				},
				{
					$project: {
						_id: 0,
						resource_id: '$_id',
						resource: '$resources',
						leagues: 1,
					},
				},
			];
			try {
				const contribution_info = await this.reportModel.aggregate(
					aggregation_pipeline,
				);
				this.logger.debug(
					`Found ${contribution_info.length} contributions for user ${orcid_identifier}`,); 
				const userUpdates = [];
				for (const contribution of contribution_info) {
					userUpdates.push(
						this.registryEntryModel.findOneAndUpdate(
							{ curator_orcid: orcid_identifier },
							{
								$set: {
									contributed_to: {
										resource_id: contribution.resource_id,
										groups: contribution.leagues,
										resource: contribution.resource,
									},
									curator: user
								},
							},
							{ upsert: true },
						),
					);
				}

				await Promise.all(userUpdates);
				return 
			} catch (error) {
				this.logger.error('Error updating user contributions');
				this.logger.error(error);
			}
		} else {
			this.logger.error(
				`No user was found with the orcid: ${orcid_identifier}`,
			);
			return null;
		}
	}

	async getCuratorEntry(orcid_identifier: string) {
		let entry: CuratorRegistryEntry = null;
		try {
			entry = await this.registryEntryModel.findOne({
				curator_orcid: orcid_identifier,
			});
		} catch (error) {
			this.logger.error(
				`Could not retrieve user with orcid: ${orcid_identifier}...`,
			);
			this.logger.error(error);
		}
		return entry;
	}
}
