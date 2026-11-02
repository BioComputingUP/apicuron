import {
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LeanDocument, ProjectionType } from 'mongoose';
import { PrivacyType } from 'src/core/enums';
import {
	CuratorRegistryEntry,
	CuratorRegistryEntryDocument,
	CuratorRegistryEntryModel,
	LeanCuratorRegistryEntryDocument,
} from 'src/core/schemas/curator-registry/curator-entry.schema';
import { User } from 'src/core/schemas/user.schema';
import { GetRegistryEntryDto } from '../dto/registry-entries.dto';
import { RegistryFilterContext } from '../rules/filters.interface';
import { RegistryFilterStrategy } from '../strategies/registry-filter.strategy';
@Injectable()
export class RegistryQueryService {
	logger = new Logger(RegistryQueryService.name);

	constructor(
		@InjectModel(CuratorRegistryEntry.name)
		protected registryEntryModel: CuratorRegistryEntryModel,
		protected privacyStrategy: RegistryFilterStrategy,
	) {}

	async getAllEntries(
		query: GetRegistryEntryDto,
		userAdministeredResourceIds: string[],
		showAll = false,
	): Promise<{
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
			// apply privacy filtering strategy
			const strategyContext: RegistryFilterContext = {
				requestedResources: query.resources,
				userAdministeredResourceIds,
				showAll: showAll,
			};
			const filteredResults = this.privacyStrategy.filter(
				strategyContext,
				entries,
			);
			const count: number = await this.registryEntryModel.count(query_filter);

			return {
				total: count,
				data: filteredResults,
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

	/**
	 * Finds the part of a contributor entry that the requesting user is allowed to see.
	 * Contributors see their whole entry, public profiles have their private groups hidden
	 * and the managers of a resource only see the contributions of a private profile to that resource.
	 * @returns the visible entry or undefined when the requesting user cannot see any of it
	 */
	async findVisibleContributorEntry(
		orcid_identifier: string,
		user: User | null | undefined,
	): Promise<LeanCuratorRegistryEntryDocument | undefined> {
		const entry = await this.findCuratorEntryByOrcid(orcid_identifier);
		if (!entry || user?.orcid_id === entry.curator_orcid) {
			return entry;
		}

		const userAdministeredResourceIds = (user?.resources ?? []).map(
			(resource) => resource.resource_id,
		);
		// same rule as the listing in GetRegistryEntryDto
		const isPublic =
			entry.privacy === PrivacyType.public ||
			entry.curator?.privacy === PrivacyType.public;
		const contributed_to = isPublic
			? entry.contributed_to
			: entry.contributed_to.filter((contribution) =>
					userAdministeredResourceIds.includes(contribution.resource_id),
			  );

		const [visibleEntry] = this.privacyStrategy.filter(
			{ userAdministeredResourceIds, showAll: false },
			[{ ...entry, contributed_to }],
		);
		if (!isPublic && visibleEntry.contributed_to.length === 0) {
			return undefined;
		}
		return visibleEntry;
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
}
