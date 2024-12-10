import {
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage, ProjectionType } from 'mongoose';
import {
	CuratorRegistryEntry,
	CuratorRegistryEntryDocument,
} from 'src/core/schemas/curator-registry/curator-entry.schema';
import { PartnerResourcesService } from 'src/resources/partner-resources/services/partner-resources.service';
import { GetRegistryEntryDto } from './dto/registry-entries.dto';
import { UserRepository } from 'src/core/repositories/user.repository';
import { Report, ReportDocument } from 'src/core/schemas/reports.schema';
import { User } from 'src/core/schemas/user.schema';
import { League, LeagueDocument, PartnerResource } from 'src/core/schemas';
import { PrivacyType } from 'src/core/enums';
import * as _ from 'lodash';
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
	async getAllEntries(query: GetRegistryEntryDto) {
		//extract user query details
		const {
			filter_field: filtered_field, //orcid or displayed name
			query: user_query, // what the user typed in the first filed
			resources: filtered_resources, // the resource list filtererd by the user
		} = query;

		//build query filter
		const query_filter: FilterQuery<CuratorRegistryEntryDocument> = {};
		const field =
			filtered_field === 'orcid_id'
				? 'curator.orcid_id'
				: 'curator.displayedName';
		if (!!user_query) {
			// clean the userquery
			const cleanQuery = _.escapeRegExp(user_query);
			query_filter[field] = { $regex: `.*${cleanQuery}.*`, $options: 'i' };
		}

		if (!!filtered_resources) {
			query_filter['contributed_to'] = {
				$elemMatch: { resource_id: { $in: filtered_resources } },
			};
		}
		// always hide private curators
		query_filter['curator.privacy'] = PrivacyType.public;

		const queryOptions: ProjectionType<CuratorRegistryEntryDocument> =
			query.getMongoQueryOptions();

		try {
			const count = await this.registryEntryModel.count(query_filter);
			const entries = await this.registryEntryModel
				.find(query_filter, {}, queryOptions)
				.lean();

			if (entries.length == 0) {
				return {
					length: 0,
					data: [],
				};
			}
			const entriesFilteredLeagues = entries.map((entry) => {
				const filteredContributedTo = entry.contributed_to
					.map((contribution) => {
						const filteredGroups = contribution.groups.filter(
							(group) => group.visibility === PrivacyType.public,
						);
						contribution.groups = filteredGroups;
						return contribution;
					})
					.filter((contribution) => contribution.groups.length > 0); // Remove null contributions
				entry.contributed_to = filteredContributedTo;
				return entry;
			});
			this.logger.debug({
				length: entriesFilteredLeagues.length,
				// data: entriesFilteredLeagues,
			});
			return {
				total: count,
				data: entriesFilteredLeagues,
			};
		} catch (error) {
			this.logger.error('Error while processing request to get all entries...');
			this.logger.error(error);
			throw new InternalServerErrorException(`Error while processing request`);
		}
	}

	async getCuratorEntry(orcid_identifier: string) {
		let entry: CuratorRegistryEntry = null;
		try {
			entry = await this.registryEntryModel
				.findOne({
					curator_orcid: orcid_identifier,
				})
				.lean();
			if (!entry) {
				const filtered_groups_entry = entry.contributed_to.map(
					(contribution) => {
						return {
							...contribution,
							groups: contribution.groups.filter(
								(group) => group.visibility === PrivacyType.public,
							),
						};
					},
				);
				const resultEntry = {
					...entry,
					contributed_to: filtered_groups_entry,
				};
				return resultEntry;
			}
		} catch (error) {
			this.logger.error(
				`Could not retrieve user with orcid: ${orcid_identifier}...`,
			);
			this.logger.error(error);
		}
		return entry;
	}

	async upsertUser(curator: User) {
		try {
			const result = await this.registryEntryModel.updateOne(
				{
					curator_orcid: curator.orcid_id,
				},
				{
					$set: {
						curator: curator,
					},
				},
				{ upsert: true },
			);

			return result;
		} catch (error) {
			this.logger.error(
				`Error while upserting user with orcid: ${curator.orcid_id}...`,
			);
			this.logger.error(error);
			throw new InternalServerErrorException(`Error while processing request`);
		}
	}

	async recomputeAllEntries() {
		// don't use this unless needed

		const aggregation_pipeline: PipelineStage[] = [
			{
				$group: {
					_id: {
						curator_orcid: '$curator_orcid',
						resource_id: '$resource_id',
					},
					leagueNames: { $addToSet: '$league' },
				},
			},
			{
				$lookup: {
					from: 'resources_def',
					localField: '_id.resource_id',
					foreignField: 'resource_id',
					as: 'resources',
				},
			},
			{ $unwind: { path: '$resources' } },
			{
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
				$group: {
					_id: '$_id.curator_orcid',
					resources: {
						$push: {
							resource_id: '$_id.resource_id',
							resource: '$resources',
							groups: '$leagues',
						},
					},
				},
			},
			{
				$lookup: {
					from: 'users',
					localField: '_id',
					foreignField: 'orcid_id',
					as: 'curator',
				},
			},
			{
				$unwind: {
					path: '$curator',
					preserveNullAndEmptyArrays: false,
				},
			},
			{
				$project: {
					_id: 0,
					curator_orcid: '$_id',
					curator: 1,
					resources: 1,
				},
			},
		];

		this.logger.debug('Updating all curator registry entries...');
		try {
			const aggregationResults = await this.reportModel.aggregate(
				aggregation_pipeline,
			);

			const updates = [];
			for (const result of aggregationResults) {
				updates.push(
					this.registryEntryModel.findOneAndUpdate(
						{ curator_orcid: result.curator_orcid },
						{
							$set: {
								contributed_to: result.resources,
								curator: result.curator,
							},
						},
						{ upsert: true },
					),
				);
			}

			await Promise.all(updates);
			this.logger.debug(
				'Updated registry collection with aggregation results',
				'',
			);
			return updates;
		} catch (error) {
			this.logger.error(
				'Error while updating registry collection with aggregation results',
			);
			this.logger.error(error);
		}
	}
	async updateLeague(league: LeagueDocument): Promise<number> {
		const resource_id = league.resource_id;
		const results = await this.registryEntryModel.updateMany(
			{
				contributed_to: { $elemMatch: { resource_id: resource_id } }, // filter by users that have contributed to the resource
			},

			{
				$set: {
					'contributed_to.$[].groups.$[group]': league, //
				},
			},
			{
				arrayFilters: [
					{
						$and: [
							{ 'group.name': league.name },
							{ 'group.resource_id': resource_id },
						],
					},
				],
			},
		);
		return results.modifiedCount;
	}

	/**
	 * Creates a new entry in the registry for a curator even if they don't exist
	 * @param curator_orcid the orcid id of the curator
	 * @param resource the contributed to resource object
	 * @param league the league (object) the curator contributed to
	 * @param curator curator (object, optional) if it exists
	 * @returns a promise resolving to the newly created entry
	 */
	async addEntry(
		curator_orcid: string,
		resource: PartnerResource,
		league: League,
		curator?: User,
	): Promise<CuratorRegistryEntryDocument> {
		try {
			const newEntry = await this.registryEntryModel.create({
				curator_orcid: curator_orcid,
				curator: curator,
				contributed_to: [
					{
						resource_id: resource.resource_id,
						resource: resource,
						groups: [league],
					},
				],
			});
			return newEntry;
		} catch (error) {
			this.logger.error(
				`Error while adding curator ${curator_orcid} to registry`,
			);
			this.logger.error(error);

			throw new InternalServerErrorException(
				`Error while adding curator ${curator_orcid} to registry`,
			);
		}
	}

	async addResourceToUser(
		curator_orcid: string,
		resource: PartnerResource,
		league: League,
	) {
		const result = await this.registryEntryModel.updateOne(
			{
				curator_orcid: curator_orcid,
			},
			{
				$push: {
					contributed_to: {
						resource_id: resource.resource_id,
						resource: resource,
						groups: [league],
					},
				},
			},
		);
		return result;
	}
	async addLeagueToUser(
		curator_orcid: string,
		resource_id: string,
		league: League,
	) {
		const result = await this.registryEntryModel.updateOne(
			{
				curator_orcid: curator_orcid,
			},
			{
				$push: {
					'contributed_to.$[elem].groups': league,
				},
			},
			{
				arrayFilters: [{ 'elem.resource_id': resource_id }],
			},
		);
		return result;
	}

	/**
	 * Checks if a curator has contributed to a given resource
	 * @param curator_orcid the orcid id of the curator
	 * @param resource_id the id of the resource
	 * @returns a promise that resolves to true if the curator has contributed to the resource, false otherwise
	 */
	async curatorContributedToResource(
		curator_orcid: string,
		resource_id: string,
	): Promise<boolean> {
		const result = await this.registryEntryModel.findOne({
			curator_orcid: curator_orcid,
			contributed_to: {
				$elemMatch: {
					resource_id: resource_id,
				},
			},
		});
		return !!result;
	}

	async removeAllEntries(resource_id: string) {
		const result = await this.registryEntryModel.deleteMany({
			contributed_to: {
				$elemMatch: {
					resource_id: resource_id,
				},
			},
		});
		return result.deletedCount;
	}
}
