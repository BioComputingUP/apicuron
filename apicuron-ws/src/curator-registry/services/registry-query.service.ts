import {
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LeanDocument, ProjectionType } from 'mongoose';
import {
	CuratorRegistryEntry,
	CuratorRegistryEntryDocument,
	CuratorRegistryEntryModel,
	LeanCuratorRegistryEntryDocument,
} from 'src/core/schemas/curator-registry/curator-entry.schema';
import { GetRegistryEntryDto } from '../dto/registry-entries.dto';
import { RegistryFilterContext } from '../rules/filters.interface';
import { PrivacyFilterStrategy } from '../strategies/privacy.strategy';

@Injectable()
export class RegistryQueryService {
	logger = new Logger(RegistryQueryService.name);

	constructor(
		@InjectModel(CuratorRegistryEntry.name)
		protected registryEntryModel: CuratorRegistryEntryModel,
		protected privacyStrategy: PrivacyFilterStrategy,
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
			return {
				total: filteredResults.length,
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
