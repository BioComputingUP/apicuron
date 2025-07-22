import { BadRequestException, Injectable} from '@nestjs/common';
import { PartnerResourcesService } from '../../services/partner-resources.service';
import { UpdateLeagueDto } from '../dto/update-league.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../../../core/schemas/resource/partner-resource.schema';
import { Model } from 'mongoose';
import { LeagueDocument } from '../../../../core/schemas/league/league.schema';
import { plainToClass } from 'class-transformer';
import { LeagueEntity } from '../dto/league.dto';
import { LeagueUpdatedEvent } from '../events/league-updated.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateLeagueDto } from '../dto/create-league.dto';

@Injectable()
export class LeagueService {
	constructor(
		protected resourceService: PartnerResourcesService,
		@InjectModel(PartnerResource.name)
		protected resourceModel: Model<PartnerResourceDocument>,
		protected eventEmitter: EventEmitter2,
	) {}

	async validateLeagueSelector(leagueSelector: {
		resource_id: string;
		league_name: string;
	}): Promise<{
		resource: PartnerResourceDocument;
		league: LeagueDocument;
		leagueIndex: number;
	}> {
		const resource = await this.resourceModel.findOne({
			resource_id: leagueSelector.resource_id,
		});
		if (!resource) {
			throw new BadRequestException(
				`Resource ${leagueSelector.resource_id} not found`,
			);
		}

		const leagueIndex = resource.leagues.findIndex(
			(league) => league.name == leagueSelector.league_name,
		);

		if (leagueIndex == -1) {
			throw new BadRequestException(
				`League ${leagueSelector.league_name} does not exist in the resource ${leagueSelector.resource_id}`,
			);
		}

		return {
			resource,
			league: resource.leagues[leagueIndex] as LeagueDocument,
			leagueIndex,
		};
	}

	validateLeagueMember(
		resource: PartnerResourceDocument,
		league_name: string,
		orcid_id: string,
	) {
		// look for another league in resource where the orcid_id is already assigned as a defaultMember
		const offendingLeague = resource.leagues.find(
			(league) =>
				league.name != league_name && league.defaultMembers.includes(orcid_id),
		);
		if (!!offendingLeague) {
			// if found, throw error
			throw new BadRequestException(
				`The member ${orcid_id} is already a member of the league ${offendingLeague.name}. Users cannot be assigned as default members of two leagues at once. Remove ${orcid_id} from the league ${offendingLeague.name} first`,
			);
		}
	}

	validateLeagueName(resource: PartnerResourceDocument, league_name: string) {
		const existingLeague = resource.leagues.find(
			(league) => league.name == league_name,
		);
		if (!!existingLeague) {
			throw new BadRequestException(
				`A league with the identifier name ${league_name} already exists in the resource ${resource.resource_id}`,
			);
		}
	}

	async updateLeague(leagueUpdate: UpdateLeagueDto): Promise<LeagueEntity> {
		const { resource, league, leagueIndex } = await this.validateLeagueSelector(
			{
				resource_id: leagueUpdate.resource_id,
				league_name: leagueUpdate.name,
			},
		);
		const oldValue = league.$clone();

		if (!!leagueUpdate.defaultMembers) {
			const errors: BadRequestException[] = [];
			for (const member of leagueUpdate.defaultMembers) {
				try {
					this.validateLeagueMember(resource, league.name, member);
				} catch (err: any) {
					errors.push(err);
				}
			}
			if (errors.length > 0) {
				throw new BadRequestException(errors.map((err) => err.message));
			}
			resource.leagues[leagueIndex].defaultMembers =
				leagueUpdate.defaultMembers;
		}

		resource.leagues[leagueIndex].visibility =
			leagueUpdate.visibility ?? league.visibility;
		resource.leagues[leagueIndex].displayedName =
			leagueUpdate.displayedName ?? league.displayedName;

		await resource.save();

		const result = plainToClass(LeagueEntity, resource.leagues[leagueIndex], {
			excludeExtraneousValues: true,
			enableCircularCheck: true,
		});

		const updateEvent = new LeagueUpdatedEvent(
			resource,
			leagueUpdate,
			oldValue,
			resource.leagues[leagueIndex] as LeagueDocument,
			leagueIndex,
		);
		await this.eventEmitter.emitAsync(LeagueUpdatedEvent.name, updateEvent);

		return result;
	}

	async createLeague(createLeague: CreateLeagueDto) {
		const resource = await this.resourceService.get_resource(
			createLeague.resource_id,
		);

		this.validateLeagueName(resource, createLeague.name);

		createLeague.defaultMembers.forEach((memberOrcid: string) => {
			this.validateLeagueMember(resource, createLeague.name, memberOrcid);
		});

		resource.leagues.push({
			name: createLeague.name,
			resource_id: createLeague.resource_id,
			displayedName: createLeague.displayedName,
			visibility: createLeague.visibility,
			defaultMembers: createLeague.defaultMembers,
		});
		await resource.save();
		return resource.getLeague(createLeague.name);
	}
}
