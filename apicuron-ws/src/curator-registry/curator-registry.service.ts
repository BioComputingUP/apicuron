import {
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as _ from 'lodash';
import {
	FilterQuery,
	LeanDocument,
	PipelineStage,
	ProjectionType,
} from 'mongoose';
import { PrivacyType } from 'src/core/enums';
import { UserRepository } from 'src/core/repositories/user.repository';
import { League, LeagueDocument, PartnerResource } from 'src/core/schemas';
import {
	CuratorRegistryEntry,
	CuratorRegistryEntryDocument,
	CuratorRegistryEntryModel,
	LeanContributionEntryDocument,
	LeanCuratorRegistryEntryDocument,
} from 'src/core/schemas/curator-registry/curator-entry.schema';
import { Report, ReportModel } from 'src/core/schemas/reports.schema';
import { User, UserDocument } from 'src/core/schemas/user.schema';
import { PartnerResourcesService } from 'src/resources/partner-resources/services/partner-resources.service';
import { GetRegistryEntryDto } from './dto/registry-entries.dto';

@Injectable()
export class CuratorRegistryService {
	constructor(
		@InjectModel(CuratorRegistryEntry.name)
		protected registryEntryModel: CuratorRegistryEntryModel,
		@InjectModel(Report.name) protected reportModel: ReportModel,
		protected userRep: UserRepository,
		protected resourceService: PartnerResourcesService,
	) {}
	logger = new Logger(CuratorRegistryService.name);

	// Create
	async createNewEntry(
		curator_orcid: string,
		curator?: User,
		contributed_to?: {
			resource: PartnerResource;
			league: League;
		},
	): Promise<CuratorRegistryEntryDocument> {
		try {
			const curator_data: User | UserDocument | null =
				curator || (await this.userRep.findOne({ orcid_id: curator_orcid }));

			if (contributed_to?.resource && contributed_to?.league) {
				return this.registryEntryModel.create({
					curator_orcid: curator_orcid,
					curator: curator_data,
					privacy: curator_data?.privacy || PrivacyType.private,
					contributed_to: [
						{
							resource_id: contributed_to.resource.resource_id,
							resource: contributed_to.resource,
							groups: [contributed_to.league],
						},
					],
				});
			} else {
				// If no resource or league is provided, create an empty entry
				return this.registryEntryModel.create({
					curator_orcid: curator_orcid,
					curator: curator_data,
					privacy: curator_data?.privacy || PrivacyType.private,
					contributed_to: [],
				});
			}
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

	async recomputeAllEntries() {
		// don't use this unless needed
		await this.removeAllEntries();

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
						privacy: result.curator.privacy || PrivacyType.private,
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

	// Read
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
			const count: number = await this.registryEntryModel.count(query_filter);

			const entries: LeanDocument<CuratorRegistryEntry>[] =
				await this.registryEntryModel
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
	async getCuratorEntry(
		orcid_identifier: string,
	): Promise<LeanCuratorRegistryEntryDocument | null> {
		let entry: LeanCuratorRegistryEntryDocument;
		try {
			entry = await this.registryEntryModel
				.findOne({
					curator_orcid: orcid_identifier,
				})
				.lean();
			return entry ?? null;
		} catch (error) {
			this.logger.error(
				`Could not retrieve user with orcid: ${orcid_identifier}...`,
			);
			this.logger.error(error);
		}
	}

	//Update
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
	async addContribution(
		orcid: string,
		resource_id: string,
		leagueName: string,
		user_data?: User,
		resource_data?: PartnerResource,
		league_data?: League,
	) {
		const [resource, user]: [PartnerResource, User] = await Promise.all([
			resource_data || this.resourceService.get_resource(resource_id),
			user_data ?? (await this.userRep.findOne({ orcid_id: orcid })).toObject(),
		]);
		if (!resource) {
			this.logger.error(`Resource ${resource_id} not found`);
			throw new NotFoundException(`Resource ${resource_id} not found`);
		}
		if (!user) {
			this.logger.error(`User with ORCID ${orcid} not found`);
			throw new NotFoundException(`User with ORCID ${orcid} not found`);
		}
		const league: League | undefined =
			league_data || resource.getLeague(leagueName);
		if (!league) {
			this.logger.error(
				`League data for ${leagueName} could not be found in ${resource.resource_id}`,
			);
			throw new InternalServerErrorException(
				`League data for ${leagueName} could not be found in ${resource.resource_id}`,
			);
		}
		const existingEntry = await this.registryEntryModel
			.findOne({ curator_orcid: orcid })
			.lean();
		// const existingEntry = await a.registryEntryModel.findOne({curator_orcid: orcid,}).lean();
		if (!existingEntry) {
			this.logger.verbose(
				'No existing entry found, creating a new one Entry:',
				existingEntry,
				orcid,
			);
			return this.createNewEntry(orcid, user, {
				resource,
				league,
			});
		}

		const existingResourceContribution = existingEntry?.contributed_to.find(
			(entry) => entry.resource_id === resource.resource_id,
		);
		// Entry exists but has no resources or the contributed resource is not in the entry

		if (
			existingEntry.contributed_to.length === 0 ||
			!existingResourceContribution
		) {
			this.logger.verbose(
				`No existing resource contribution found for resource ${resource.resource_id}, adding it`,
			);
			return this.addResourceToUser(orcid, resource, league);
		}

		// resource exists, check if league is already in the contribution list and add it if not
		const existingLeague = existingResourceContribution.groups.find(
			(group) => group.name === league.name,
		);
		if (!existingLeague) {
			this.logger.verbose(
				`League ${league.name} not found in resource ${resource.resource_id}, adding it`,
			);
			return this.addLeagueToUser(orcid, resource_id, league);
		}
		// League already exists, no action needed
		return existingEntry;
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

	private async addResourceToUser(
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

	private async addLeagueToUser(
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

	async recomputeResourceAggregate(resource_id: string): Promise<void> {
		const resource = await this.resourceService.get_resource(resource_id);
		if (!resource) {
			this.logger.error(`Resource ${resource_id} not found`);
			throw new NotFoundException(`Resource ${resource_id} not found`);
		}
		await this.clearEntriesForResource(resource_id);
		const aggregation_pipeline: PipelineStage[] = [
			{
				$match: {
					resource_id: resource_id,
				},
			},
			{
				$group: {
					_id: '$curator_orcid',
					leagues: {
						$addToSet: '$league_data',
					},
				},
			},
		];
		const aggregationResults = await this.reportModel.aggregate<{
			_id: string;
			leagues: League[];
		}>(aggregation_pipeline);
		// this needs to be disabled because if you try to use its true type (AnyBulkWriteOperation<CuratorRegistryEntry>[])
		// it causes a deep type inferences that loads infinetly and crashes tsserver
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const bulkOps: any[] = aggregationResults.map((aggResult) => ({
			updateOne: {
				filter: { curator_orcid: aggResult._id },
				update: {
					$push: {
						contributed_to: {
							resource_id: resource_id,
							resource: resource,
							groups: aggResult.leagues,
						},
					},
				},
			},
		}));

		if (aggregationResults.length === 0) return;

		try {
			const result = await this.registryEntryModel.bulkWrite(bulkOps);
			this.logger.debug(
				`Recomputed ${result.modifiedCount} aggregates for resource ${resource_id}`,
			);
		} catch (error) {
			this.logger.error(
				`Error while recomputing resource aggregate for resource ${resource_id}`,
				error,
			);
			throw new InternalServerErrorException(
				`Error while recomputing resource aggregate for resource ${resource_id}`,
			);
		}
	}

	// Delete
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

	async clearEntriesForResource(resource_id: string) {
		this.logger.warn(`Clearing entries for resource ${resource_id}...`);
		const result = await this.registryEntryModel.updateMany(
			{
				'contributed_to.resource_id': resource_id,
			},
			{
				$pull: {
					contributed_to: {
						resource_id: resource_id,
					},
				},
			},
		);
		this.logger.verbose(
			`Cleared ${result.modifiedCount} entries for resource ${resource_id}`,
		);

		return result.modifiedCount;
	}

	async deleteLeague(resource_id: string, league: string): Promise<number> {
		this.logger.warn(
			`Deleting league ${league} for all contributors of resource ${resource_id}...`,
		);
		const result = await this.registryEntryModel.updateMany(
			{
				'contributed_to.resource_id': resource_id,
			},
			{
				$pull: {
					'contributed_to.$[].groups': { name: league },
				},
			},
		);
		this.logger.verbose(
			`Deleted league ${league} for ${result.modifiedCount} contributors of resource ${resource_id}`,
		);
		return result.modifiedCount;
	}

	async updateResource(resource: PartnerResource): Promise<void> {
		const result = await this.registryEntryModel.updateMany(
			{
				'contributed_to.resource_id': resource.resource_id,
			},
			{
				$set: {
					'contributed_to.$[elem].resource': resource,
				},
			},
			{
				arrayFilters: [{ 'elem.resource_id': resource.resource_id }],
			},
		);
		this.logger.debug(
			`Updated ${result.modifiedCount} entries for resource ${resource.resource_id}`,
		);
	}
}
