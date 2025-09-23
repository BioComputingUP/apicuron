import { StorageService } from '@biocomputingup/nest-storage-manager/dist/services/storage.service';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, LeanDocument, Types } from 'mongoose';
import { PartnerResourceRepository } from 'src/core/repositories/partner-resource.repository';
import { assertIsDefined } from 'src/util/type-assertion.helper';
import {
	League,
	LeagueDocument,
} from '../../../core/schemas/league/league.schema';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../../core/schemas/resource/partner-resource.schema';
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
		protected storage: StorageService,
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
		assertIsDefined(doc, `Resource with ID ${resource_id} not found.`);
		return doc;
	}

	async exists(resource_id: string): Promise<boolean> {
		return !!(await this.partnerResourceRepo.exists({ resource_id }));
	}

	async update_resource(
		resource_update: UpdatePartnerResourceDto & { logo?: string },
	): Promise<PartnerResourceDocument> {
		const { resource_id } = resource_update;
		const newResource = await this.partnerResourceRepo.findOneAndUpdate(
			{ resource_id },
			{ $set: resource_update },
			{ new: true },
		);
		assertIsDefined(newResource, `Resource with ID ${resource_id} not found.`);
		return newResource;
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
}
