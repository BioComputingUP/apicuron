import { StorageService } from '@biocomputingup/nest-storage-manager';
import {
	BadRequestException,
	ConflictException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { readFile } from 'fs/promises';
import { FilterQuery, LeanDocument, Types } from 'mongoose';
import { join } from 'path';
import { PartnerResourceRepository } from 'src/core/repositories/partner-resource.repository';
import { SourceSystem } from 'src/core/schemas/components/resource-source.schema';
import { StorageType } from 'src/storage/storage.config';
import { FileUploadDto } from 'src/util/file-upload.helper';
import { assertIsDefined } from 'src/util/type-assertion.helper';
import {
	League,
	LeagueDocument,
} from '../../../core/schemas/league/league.schema';
import {
	PartnerResource,
	PartnerResourceDocument,
	PartnerResourceModel,
} from '../../../core/schemas/resource/partner-resource.schema';
import {
	MAX_ALLOWED_HOSTS,
	UpdateAllowedHostsDto,
} from '../../dto/allowed-hosts.dto';
import { UpdatePartnerResourceDto } from '../../dto/updateResource.dto';
import { AddMemberToLeague } from '../leagues/dto/add-member-to-league.dto';
import { DeleteLeagueDTO } from '../leagues/dto/delete-league.dto';
import { LeagueDeletedEvent } from '../leagues/events/league-deleted-event';

@Injectable()
export class PartnerResourcesService {
	constructor(
		@InjectModel(PartnerResource.name)
		private partnerResourceRepo: PartnerResourceRepository,
		protected eventEmitter: EventEmitter2,
		private storageService: StorageService,
		@InjectModel(PartnerResource.name)
		protected readonly partnerResourceModel: PartnerResourceModel,
	) {}

	logger = new Logger(PartnerResourcesService.name);
	async get_resources(
		filter: FilterQuery<PartnerResourceDocument> = {},
	): Promise<PartnerResourceDocument[]> {
		const resources = await this.partnerResourceRepo.find(filter).sort({
			'stats.contributionCount': -1,
			'stats.uniqueContributors': -1,
		});

		return resources;
	}

	async addMemberToLeague(addMemberToLeague: AddMemberToLeague) {
		const resourceUpdated = await this.partnerResourceRepo.findOneAndUpdate(
			{
				resource_id: addMemberToLeague.resource_id,
			},
			{
				$push: {
					'leagues.$[matchingLeague].defaultMembers': addMemberToLeague.member,
				},
			},
			{
				arrayFilters: [{ 'matchingLeague.name': addMemberToLeague.league }],
				new: true,
			},
		);
		if (!resourceUpdated) {
			throw new BadRequestException(
				`Resource with ID ${addMemberToLeague.resource_id} not found.`,
			);
		}
		return resourceUpdated;
	}

	async removeMemberFromLeague(
		removeMemberFromLeague: AddMemberToLeague,
	): Promise<PartnerResourceDocument> {
		const resourceUpdated = await this.partnerResourceRepo.findOneAndUpdate(
			{
				resource_id: removeMemberFromLeague.resource_id,
			},
			{
				$pull: {
					'leagues.$[matchingLeague].defaultMembers':
						removeMemberFromLeague.member,
				},
			},
			{
				arrayFilters: [
					{ 'matchingLeague.name': removeMemberFromLeague.league },
				],
				new: true,
			},
		);
		assertIsDefined(
			resourceUpdated,
			`Resource with ID ${removeMemberFromLeague.resource_id} not found.`,
		);
		return resourceUpdated;
	}

	async deleteLeague(
		deleteLeague: DeleteLeagueDTO,
	): Promise<PartnerResourceDocument> {
		const resource = await this.partnerResourceRepo.findOne({
			resource_id: deleteLeague.resource_id,
		});
		assertIsDefined(
			resource,
			`Resource with ID ${deleteLeague.resource_id} not found.`,
		);
		// check if this is the last and only league, if it is we return an error
		if (resource.leagues.length == 1) {
			throw new BadRequestException(
				`The resource ${resource.resource_name} only has one remaining league ${resource.leagues[0].name}. It cannot be deleted`,
			);
		}
		if (resource.defaultLeague == deleteLeague.league) {
			throw new BadRequestException(
				`The League ${deleteLeague.league} is set as  the default league for resource ${resource.resource_name}. Change the default league for the resource to proceed to delete it, use the PUT route (/partner-resources)`,
			);
		}
		const resourceUpdated = await this.partnerResourceRepo.findOneAndUpdate(
			{
				resource_id: deleteLeague.resource_id,
			},
			{
				$pull: {
					leagues: { name: deleteLeague.league },
				},
			},
			{
				new: true,
			},
		);
		assertIsDefined(
			resourceUpdated,
			`Resource with ID ${deleteLeague.resource_id} not found.`,
		);
		await this.eventEmitter.emitAsync(
			LeagueDeletedEvent.name,
			new LeagueDeletedEvent(deleteLeague.league, deleteLeague.resource_id),
		);
		return resourceUpdated;
	}

	async count() {
		return await this.partnerResourceRepo.count();
	}

	async retrieve_uri(resource_id: string) {
		const resource = await this.partnerResourceRepo.findOne({ resource_id });
		if (!resource) {
			// this.transformService.warn('resource_id', `Incorrect resource_id: ${resource_id} Not found, parameter ignored`)
			return null;
		} else {
			return resource.resource_uri;
		}
	}

	async get_resource(resource_id: string): Promise<PartnerResourceDocument> {
		const doc = await this.partnerResourceRepo.findOne({ resource_id });
		assertIsDefined(
			doc,
			`Resource with ID ${resource_id} not found.`,
			NotFoundException,
		);
		return doc;
	}

	async exists(resource_id: string): Promise<boolean> {
		return !!(await this.partnerResourceRepo.exists({ resource_id }));
	}

	async update_resource(
		resource_update: UpdatePartnerResourceDto,
		logo?: Express.Multer.File,
	): Promise<PartnerResourceDocument> {
		const { resource_id, ...updates } = resource_update;

		if (logo) {
			const logoFile = FileUploadDto.fromMulter(logo);
			logoFile.buffer = logo.buffer || (await readFile(logo.path));
			const publicEngine = this.storageService.getEngine(StorageType.public);
			const logoReference = await publicEngine.put(
				join('resources', logoFile.filename),
				logoFile.buffer,
			);
			updates.logo = logoReference;
			this.logger.debug(
				`Updating logo for resource ${resource_id} to ${logoReference}`,
			);
		}

		const newResource = await this.partnerResourceRepo.findOneAndUpdate(
			{ resource_id },
			{ $set: updates },
			{ new: true },
		);

		assertIsDefined(newResource, `Resource with ID ${resource_id} not found.`);
		return newResource;
	}

	/**
	 * Adds and removes hosts allowed in the entity_uri of the resource reports.
	 * Entries are compared by host and added ones are stored as https://<host>.
	 */
	async update_allowed_hosts(
		resource_id: string,
		{ add = [], remove = [] }: UpdateAllowedHostsDto,
	): Promise<PartnerResourceDocument> {
		const resource = await this.get_resource(resource_id);

		const removedHosts = remove.map(getHost);
		const allowed = resource.allowedUrlsPrefix.filter(
			(url) => !removedHosts.includes(getHost(url)),
		);
		for (const url of add) {
			const host = getHost(url);
			if (!allowed.some((allowedUrl) => getHost(allowedUrl) === host)) {
				allowed.push(`https://${host}`);
			}
		}
		if (allowed.length > MAX_ALLOWED_HOSTS) {
			throw new BadRequestException(
				`A resource can allow at most ${MAX_ALLOWED_HOSTS} hosts, this change would make ${allowed.length}.`,
			);
		}

		// the model is used directly, as on linkSource: the copies of the resource kept by
		// other collections are not updated, as nothing reads the allowed hosts from them
		const updated = await this.partnerResourceModel.findOneAndUpdate(
			{ resource_id },
			{ $set: { allowedUrlsPrefix: allowed } },
			{ new: true },
		);
		assertIsDefined(
			updated,
			`Resource with ID ${resource_id} not found.`,
			NotFoundException,
		);
		return updated;
	}

	public getResourceLeagues(
		resource: PartnerResourceDocument | LeanDocument<PartnerResourceDocument>,
	): [
		PartnerResourceDocument | LeanDocument<PartnerResourceDocument>,
		LeanDocument<LeagueDocument>,
	][] {
		return resource.leagues.map(
			(
				league: Types.Subdocument<Types.ObjectId> & League,
			): [
				PartnerResourceDocument | LeanDocument<PartnerResourceDocument>,
				LeanDocument<LeagueDocument>,
			] => {
				return [resource, league.toObject()];
			},
		);
	}

	public getUserLeague(
		resource: PartnerResourceDocument | LeanDocument<PartnerResourceDocument>,
		orcid_id: string,
	) {
		resource.leagues.forEach((league) => {
			if (league.defaultMembers.includes(orcid_id)) {
				return league;
			}
		});

		return resource.defaultLeague;
	}

	async linkSource(
		resource_id: string,
		source: { system: SourceSystem; repository_id: string; full_name: string },
	): Promise<{ linked: boolean }> {
		const linkedElsewhere = await this.partnerResourceModel
			.findOne({
				resource_id: { $ne: resource_id },
				'sources.system': source.system,
				'sources.repository_id': source.repository_id,
			})
			.lean();
		if (linkedElsewhere) {
			throw new ConflictException(
				`Repository ${source.repository_id} (${source.full_name}) is already linked to resource "${linkedElsewhere.resource_id} (${linkedElsewhere.resource_name})".`,
			);
		}

		// Push only if not already linked to this resource (array uniqueness is not enforced by the index)
		const result = await this.partnerResourceModel.updateOne(
			{ resource_id, 'sources.repository_id': { $ne: source.repository_id } },
			{ $push: { sources: { ...source, linked_at: new Date() } } },
		);

		if (source.system === SourceSystem.GITHUB) {
			await this.partnerResourceModel.updateOne(
				{ resource_id },
				{ $addToSet: { allowedUrlsPrefix: 'https://github.com' } },
			);
		}

		return { linked: result.modifiedCount === 1 };
	}
}

/**
 * Reads the host of a URL or of a bare host such as doi.org.
 */
function getHost(urlOrHost: string): string {
	const value = urlOrHost.trim();
	if (value.includes('://')) {
		try {
			return new URL(value).host;
		} catch {
			// compared as a bare host below
		}
	}
	return value.toLowerCase().replace(/\/+$/, '');
}
