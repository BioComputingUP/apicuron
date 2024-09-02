import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, LeanDocument, Model } from 'mongoose';
import { PartnerResourceDocument } from '../../../core/schemas/resource/partner-resource.schema';
import { PartnerResource } from '../../../core/schemas/resource/partner-resource.schema';
import { UpdatePartnerResourceDto } from '../../dto/updateResource.dto';
import { League } from '../../../core/schemas/league/league.schema';
import { CreateLeagueDto } from '../leagues/dto/create-league.dto';
import { AddMemberToLeague } from '../leagues/dto/add-member-to-league.dto';
import { DeleteLeagueDTO } from '../leagues/dto/delete-league.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LeagueDeletedEvent } from '../leagues/events/league-deleted-event';

@Injectable()
export class PartnerResourcesService {
	constructor(
		@InjectModel(PartnerResource.name)
		private partnerResourceModel: Model<PartnerResourceDocument>, // protected transformService: TransformerService
		protected eventEmitter: EventEmitter2,
	) {}
	async get_resources(
		filter: FilterQuery<PartnerResourceDocument> = {},
	): Promise<PartnerResourceDocument[]> {
		return await this.partnerResourceModel.find(filter);
	}

	async createLeague(createLeague: CreateLeagueDto): Promise<League> {
		const resource = await this.get_resource(createLeague.resource_id);

		resource.leagues.push({
			name: createLeague.name,
			displayedName: createLeague.displayedName,
			visibility: createLeague.visibility,
			defaultMembers: createLeague.defaultMembers,
		});
		await resource.save();
		return resource.getLeague(createLeague.name);
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
		return await this.partnerResourceModel.findOne({ resource_id });
	}

	async exists(resource_id: string): Promise<boolean> {
		return !!(await this.partnerResourceModel.exists({ resource_id }));
	}

	async update_resource(
		resource_update: UpdatePartnerResourceDto & { logo?: string },
	) {
		const { resource_id } = resource_update;

		return await this.partnerResourceModel.updateOne(
			{ resource_id },
			resource_update,
		);
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
