import {
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as _ from 'lodash';
import { FilterQuery, Model, PipelineStage, ProjectionType } from 'mongoose';
import { PrivacyType } from 'src/core/enums';
import { UserRepository } from 'src/core/repositories/user.repository';
import {
	League,
	LeagueDocument,
	PartnerResource,
	PartnerResourceDocument,
} from 'src/core/schemas';
import {
	CuratorRegistryEntry,
	CuratorRegistryEntryDocument,
	LeanContributionEntryDocument,
	LeanCuratorRegistryEntryDocument,
} from 'src/core/schemas/curator-registry/curator-entry.schema';
import {
	LeanReportDocument,
	Report,
	ReportDocument,
} from 'src/core/schemas/reports.schema';
import { User, UserDocument } from 'src/core/schemas/user.schema';
import { PartnerResourcesService } from 'src/resources/partner-resources/services/partner-resources.service';
import { GetRegistryEntryDto } from './dto/registry-entries.dto';
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
					.map((contribution: LeanContributionEntryDocument) => {
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

	async getCuratorEntry(
		orcid_identifier: string,
	): Promise<LeanCuratorRegistryEntryDocument | undefined> {
		let entry: LeanCuratorRegistryEntryDocument;
		try {
			entry = await this.registryEntryModel
				.findOne({
					curator_orcid: orcid_identifier,
				})
				.lean();
			return entry;
		} catch (error) {
			this.logger.error(
				`Could not retrieve user with orcid: ${orcid_identifier}...`,
			);
			this.logger.error(error);
		}
	}

	private async removeAllEntries() {
		try {
			this.logger.warn('Deleting all curator registry entries...');
			await this.registryEntryModel.deleteMany({});
			this.logger.debug('All curator registry entries deleted');
		} catch (error) {
			this.logger.error(
				'Error while deleting all curator registry entries',
				error,
			);
			throw new Error('Error while deleting all curator registry entries');
		}
	}
	async recomputeAllEntries() {
		// don't use this unless needed
		this.removeAllEntries();

		const aggregation_pipeline: PipelineStage[] = [
			{
				$group: {
					// Build a list of leagues in each resource that was contributed to, and group by user
					_id: {
						curator_orcid: '$curator_orcid',
						resource_id: '$resource_id',
					},
					leagueNames: { $addToSet: '$league' },
				},
			},
			{
				// Get the resource details
				$lookup: {
					from: 'resources_def',
					localField: '_id.resource_id',
					foreignField: 'resource_id',
					as: 'resources',
				},
			},
			{ $unwind: { path: '$resources' } },
			{
				// populate league field
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
				// Build the final output structure
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
				// Lookup the user details
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

			const updates: Promise<CuratorRegistryEntryDocument>[] = [];
			for (const result of aggregationResults) {
				updates.push(
					this.registryEntryModel.create({
						curator_orcid: result.curator_orcid,
						contributed_to: result.resources,
						curator: result.curator,
					}),
				);
			}
			await Promise.all(updates);
			this.logger.debug('Recreated All Entries');
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

	async updateUserData(
		orcid: string,
		newUserData: User | UserDocument,
	): Promise<boolean> {
		try {
			const result = await this.registryEntryModel.updateOne(
				{ curator_orcid: orcid },
				{ curator: newUserData },
			);
			return result.modifiedCount > 0;
		} catch (error) {
			this.logger.error(
				`Error while updating user data for curator with ORCID ${orcid}`,
				error,
			);
			throw new Error(
				`Error while updating user data for curator with ORCID ${orcid}`,
			);
		}
	}
	async createUserEntry(
		orcid: string,
		user?: User | UserDocument,
	): Promise<CuratorRegistryEntryDocument | undefined> {
		try {
			const userData =
				user ?? (await this.userRep.findOne({ orcid_id: orcid }));
			if (!userData) {
				this.logger.error(
					`User with ORCID ${orcid} not found in database, skipping creating entry for them`,
				);
				return;
			}
			const newEntry = await this.registryEntryModel.create({
				curator_orcid: orcid,
				curator: user,
				contributed_to: [],
			});
			this.logger.debug(`Created empty entry for user ${orcid}`);
			return newEntry;
		} catch (error) {
			this.logger.error(`Error while creating user entry for ${orcid}`);
			this.logger.error(error);
			throw new InternalServerErrorException(
				`Error while creating user entry for ${orcid}`,
			);
		}
	}

	async addEntry(
		curator_orcid: string,
		resource: PartnerResource | PartnerResourceDocument,
		league: League | LeagueDocument,
		curator?: User | UserDocument,
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
	): Promise<CuratorRegistryEntryDocument> {
		try {
			const result = await this.registryEntryModel.findOneAndUpdate(
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
			if (!result) {
				this.logger.error(
					`No registry entry found for curator ${curator_orcid}`,
				);
				throw new InternalServerErrorException(
					`No registry entry found for curator ${curator_orcid}`,
				);
			}
			return result;
		} catch (error) {
			this.logger.error(
				`Error while adding resource ${resource.resource_id} to curator ${curator_orcid}`,
				error,
			);
			this.logger.error(error);
			throw new InternalServerErrorException(
				`Error while adding resource ${resource.resource_id} to curator ${curator_orcid}`,
			);
		}
	}
	async addLeagueToUser(
		curator_orcid: string,
		resource_id: string,
		league: League,
	): Promise<CuratorRegistryEntryDocument> {
		try {
			const result = await this.registryEntryModel.findOneAndUpdate(
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
			if (!result) {
				this.logger.error(
					`No registry entry found for curator ${curator_orcid}`,
				);
				throw new InternalServerErrorException(
					`No registry entry found for curator ${curator_orcid}`,
				);
			}
			return result;
		} catch (error) {
			this.logger.error(
				`Error while adding league ${league.name} to resource ${resource_id} for curator ${curator_orcid}`,
				error,
			);
			throw new InternalServerErrorException(
				`Error while adding league ${league.name} to resource ${resource_id} for curator ${curator_orcid}`,
			);
		}
	}

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

	async deleteAllEntriesOfResource(resource_id: string) {
		const result = await this.registryEntryModel.deleteMany({
			contributed_to: {
				$elemMatch: {
					resource_id: resource_id,
				},
			},
		});
		return result.deletedCount;
	}

	async applyReportToCuratorRegistry(
		report: Report | ReportDocument | LeanReportDocument,
		resource_data?: PartnerResource | PartnerResourceDocument,
		user_data?: User | UserDocument,
	): Promise<CuratorRegistryEntryDocument | LeanCuratorRegistryEntryDocument> {
		const resource: PartnerResource | PartnerResourceDocument =
			resource_data ||
			(await this.resourceService.get_resource(report.resource_id));

		const user: User | UserDocument =
			user_data ||
			(await this.userRep.findOne({ orcid_id: report.curator_orcid }));
		const league: League | LeagueDocument | undefined =
			report.league_data ??
			resource.leagues.find((league) => league.name === report.league);
		if (!league) {
			this.logger.error(
				`League data not found in resource ${resource.resource_id}`,
			);
			throw new InternalServerErrorException(
				`League data not found in resource ${resource.resource_id}`,
			);
		}
		const existingEntry = await this.registryEntryModel
			.findOne({
				curator_orcid: report.curator_orcid,
			})
			.lean();
		if (!existingEntry) {
			return this.addEntry(report.curator_orcid, resource, league, user);
		}

		// Entry exists but has no resources or the contributed resource is not in the entry
		const existingResource = existingEntry.contributed_to.find(
			(entry) => entry.resource_id === resource.resource_id,
		);
		if (existingEntry.contributed_to.length === 0 || !existingResource) {
			return this.addResourceToUser(report.curator_orcid, resource, league);
		}

		// resource exists, check if league is already in the contribution list and add it if not
		const existingLeague = existingResource.groups.find(
			(group) => group.name === league.name,
		);
		if (!existingLeague) {
			return this.addLeagueToUser(
				report.curator_orcid,
				resource.resource_id,
				league,
			);
		}
		// League already exists, no action needed
		return existingEntry;
	}
}
