import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, LeanDocument, Model } from 'mongoose';
import { PartnerResourceDocument } from '../../../core/schemas/resource/partner-resource.schema';
import { PartnerResource } from '../../../core/schemas/resource/partner-resource.schema';
import { UpdatePartnerResourceDto } from '../../dto/updateResource.dto';
import { League } from '../../../core/schemas/league/league.schema';
import { AddMemberToLeague } from '../leagues/dto/add-member-to-league.dto';
import { DeleteLeagueDTO } from '../leagues/dto/delete-league.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LeagueDeletedEvent } from '../leagues/events/league-deleted-event';
import _ from 'lodash';
import { PartnerResourceUpdatedEvent } from '../events/resource-updated.event';
import { PartnerResourceEntity } from '../../dto/partner-resources.entity';
import { plainToInstance } from 'class-transformer';
import { StorageService } from '@biocomputingup/nest-storage-manager/dist/services/storage.service';

@Injectable()
export class PartnerResourcesService {
	constructor(
		@InjectModel(PartnerResource.name)
		private partnerResourceModel: Model<PartnerResourceDocument>, // protected transformService: TransformerService
		protected eventEmitter: EventEmitter2,
		protected storage: StorageService,
	) {}

	logger = new Logger(PartnerResourcesService.name);
	async get_resources(
		filter: FilterQuery<PartnerResourceDocument> = {},
	): Promise<PartnerResourceDocument[]> {
		const resources = await this.partnerResourceModel.find(filter).sort({
			'stats.contributionCount': -1,
			'stats.uniqueContributors': -1,
		});

		return resources;
	}

	async addMemberToLeague(addMemberToLeague: AddMemberToLeague) {
		const resourceUpdated = await this.partnerResourceModel.findOneAndUpdate(
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
		return resourceUpdated;
	}

	async removeMemberFromLeague(
		removeMemberFromLeague: AddMemberToLeague,
	): Promise<PartnerResourceDocument> {
		const resourceUpdated = await this.partnerResourceModel.findOneAndUpdate(
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
		return resourceUpdated;
	}

	async deleteLeague(
		deleteLeague: DeleteLeagueDTO,
	): Promise<PartnerResourceDocument> {
		// check if this is the last and only league, if it is we return an error

		const resource = await this.partnerResourceModel.findOne({
			resource_id: deleteLeague.resource_id,
		});
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
		const resourceUpdated = await this.partnerResourceModel.findOneAndUpdate(
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
		await this.eventEmitter.emitAsync(
			LeagueDeletedEvent.name,
			new LeagueDeletedEvent(deleteLeague.league, deleteLeague.resource_id),
		);
		return resourceUpdated;
	}

	async count() {
		return await this.partnerResourceModel.count();
	}

	async retrieve_uri(resource_id: string) {
		const resource = await this.partnerResourceModel.findOne({ resource_id });
		if (!resource) {
			// this.transformService.warn('resource_id', `Incorrect resource_id: ${resource_id} Not found, parameter ignored`)
			return null;
		} else {
			return resource.resource_uri;
		}
	}

	async get_resource(resource_id: string): Promise<PartnerResourceDocument> {
		const doc = await this.partnerResourceModel.findOne({ resource_id });
		return doc;
	}

	async exists(resource_id: string): Promise<boolean> {
		return !!(await this.partnerResourceModel.exists({ resource_id }));
	}

	async update_resource(
		resource_update: UpdatePartnerResourceDto & { logo?: string },
	) {
		const { resource_id } = resource_update;

		const resource = await this.get_resource(resource_id);

		// const update = await resource.update({ $set: resource_update });

		const newResource = await this.partnerResourceModel.findOneAndUpdate(
			{ resource_id },
			{ $set: resource_update },
			{ new: true },
		);

		await this.eventEmitter.emitAsync(
			PartnerResourceUpdatedEvent.name,
			new PartnerResourceUpdatedEvent(resource, newResource),
		);

		return newResource;
	}

	public getResourceLeagues(
		resource: PartnerResourceDocument | LeanDocument<PartnerResource>,
	): [PartnerResourceDocument | LeanDocument<PartnerResource>, League][] {
		return resource.leagues.map((league) => {
			return [resource, league];
		});
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
