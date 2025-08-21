import {
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LeanDocument, ProjectionType } from 'mongoose';
import { PrivacyType } from 'src/core/enums';
import {
	ContributionEntry,
	CuratorRegistryEntry,
	CuratorRegistryEntryDocument,
	CuratorRegistryEntryModel,
	LeanCuratorRegistryEntryDocument,
} from 'src/core/schemas/curator-registry/curator-entry.schema';
import { GetRegistryEntryDto } from '../dto/registry-entries.dto';

@Injectable()
export class RegistryQueryService {
	logger = new Logger(RegistryQueryService.name);

	constructor(
		@InjectModel(CuratorRegistryEntry.name)
		protected registryEntryModel: CuratorRegistryEntryModel,
	) {}

	async getAllEntries(query: GetRegistryEntryDto): Promise<{
		total: number;
		data: LeanCuratorRegistryEntryDocument[];
	}> {
		const query_filter = query.buildQueryFilter();
		const queryOptions: ProjectionType<CuratorRegistryEntryDocument> =
			query.getMongoQueryOptions();

		try {
			const entries: LeanDocument<CuratorRegistryEntry>[] =
				await this.registryEntryModel
					.find(query_filter, {}, queryOptions)
					.lean();

			if (entries.length == 0) {
				return {
					total: 0,
					data: [],
				};
			}
			let filteredEntries = RegistryQueryService.filterPrivateEntries(entries);
			if (query.resources) {
				filteredEntries = RegistryQueryService.filterNonQueriedResources(
					filteredEntries,
					query.resources,
				);
			}

			return {
				total: filteredEntries.length,
				data: filteredEntries,
			};
		} catch (error) {
			this.logger.error(
				'Error while processing request to get all entries...',
				error,
			);
			throw new InternalServerErrorException(
				`Error while querying registry entries`,
			);
		}
	}
	async findCuratorEntryByOrcid(
		orcid_identifier: string,
	): Promise<LeanCuratorRegistryEntryDocument | undefined> {
		let entry: LeanCuratorRegistryEntryDocument;
		try {
			entry = await this.registryEntryModel
				.findOne({
					curator_orcid: orcid_identifier,
				})
				.lean();
			return entry ?? undefined;
		} catch (error) {
			this.logger.error(
				`Could not retrieve user with orcid: ${orcid_identifier}...`,
				error,
			);
			throw new InternalServerErrorException(
				`Error while retrieving user with orcid: ${orcid_identifier}`,
			);
		}
	}

	private static filterPrivateUsers(
		unfilteredEntries: CuratorRegistryEntry[],
	): CuratorRegistryEntry[] {
		return unfilteredEntries.filter(
			(entry) => entry.privacy === PrivacyType.public,
		);
	}

	private static filterNonQueriedResources(
		entries: CuratorRegistryEntry[],
		queried_resources: string[],
	): CuratorRegistryEntry[] {
		return entries.filter((entry) =>
			entry.contributed_to.some((contribution) =>
				queried_resources.includes(contribution.resource_id),
			),
		);
	}

	private static filterPrivateContributions(
		allContributions: ContributionEntry[],
	): ContributionEntry[] {
		const res = allContributions
			.map((contribution) => {
				const filteredGroups = contribution.groups.filter(
					(group) => group.visibility === PrivacyType.public,
				);
				return {
					...contribution,
					groups: filteredGroups,
				};
			})
			.filter((contribution) => contribution.groups.length > 0); // Remove contributions with empty groups

		return res;
	}

	private static filterPrivateEntries(allEntries: CuratorRegistryEntry[]) {
		return RegistryQueryService.filterPrivateUsers(allEntries).map((entry) => ({
			...entry,
			contributed_to: RegistryQueryService.filterPrivateContributions(
				entry.contributed_to,
			),
		}));
	}
}
