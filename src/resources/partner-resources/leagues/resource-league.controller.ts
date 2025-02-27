import {
	Body,
	Controller,
	Delete,
	ForbiddenException,
	Get,
	NotFoundException,
	Param,
	Post,
	Put,
} from '@nestjs/common';
import { AuthProtected } from '../../../auth/decorators/auth.decorator';
import { UserReq } from '../../../auth/decorators/applyUser.decorator';
import { User } from '../../../core/schemas/user.schema';
import { PartnerResourcesService } from '../services/partner-resources.service';
import { VersionHeader } from '../../../plugins/swagger/config';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateLeagueDto } from './dto/create-league.dto';
import { AddMemberToLeague } from './dto/add-member-to-league.dto';
import { DeleteMemberFromLeagueDTO } from './dto/delete-from-league.dto';
import { DeleteLeagueDTO } from './dto/delete-league.dto';
import { LeagueEntity } from './dto/league.dto';
import { PartnerResourceEntity } from '../../dto/partner-resources.entity';
import { plainToClass, plainToInstance } from 'class-transformer';
import { ApiResponseWrapped } from '../../../shared/decorators/wrapped-data-response.decorator';
import { LeagueService } from './services/league.service';
import { UpdateLeagueDto } from './dto/update-league.dto';

@ApiTags('Leagues')
@ApiHeader(VersionHeader)
@Controller({ path: 'leagues', version: '2' })
export class ResourceLeagueController {
	constructor(
		protected resourceService: PartnerResourcesService,
		protected leagueService: LeagueService,
	) {}

	private userCanAccessResource(user: User | null, resourceId: string) {
		if (!user) {
			throw new ForbiddenException(
				'You must be logged in to access this resource',
			);
		}
		if (!user.resources.map((r) => r.resource_id).includes(resourceId)) {
			throw new ForbiddenException(
				`You do not have access to update the resource (${resourceId})`,
			);
		}
	}

	@ApiOperation({
		summary: 'Get the leagues of a resource',
	})
	@ApiResponseWrapped([LeagueEntity])
	@AuthProtected()
	@Get(':resource_id')
	async getLeagues(
		@UserReq() user: User,
		@Param('resource_id') resourceId: string,
	): Promise<{ data: LeagueEntity[] }> {
		const resource = await this.resourceService.get_resource(resourceId);
		if (!resource) {
			throw new NotFoundException(`Resource (${resourceId}) Not Found`);
		}
		this.userCanAccessResource(user, resourceId);

		const leagues = plainToInstance(LeagueEntity, resource.leagues, {
			excludeExtraneousValues: true,
		});

		return { data: leagues };
	}

	@ApiOperation({
		summary: 'Create a new league for a resource',
	})
	@Post()
	@AuthProtected()
	async createLeague(
		@Body() createLeague: CreateLeagueDto,
		@UserReq() user: User | null,
	): Promise<LeagueEntity> {
		this.userCanAccessResource(user, createLeague.resource_id);
		const league = await this.leagueService.createLeague(createLeague);
		return league as LeagueEntity;
	}

	@ApiOperation({
		summary: `Add an orcid id as a default member of a league in a specific resource`,
	})
	@Post('add-member')
	@AuthProtected()
	async addMemberToLeague(
		@Body() addMemberToLeague: AddMemberToLeague,
		@UserReq() user: User | null,
	) {
		this.userCanAccessResource(user, addMemberToLeague.resource_id);

		const updatedResource = await this.resourceService.addMemberToLeague(
			addMemberToLeague,
		);

		return updatedResource.getLeague(addMemberToLeague.league) as LeagueEntity;
	}

	@ApiOperation({
		summary: `Updates the data associated with a league`,
	})
	@ApiResponseWrapped(
		LeagueEntity,
		201,
		`A response containing the updated league`,
	)
	@Put('')
	@AuthProtected()
	async updateLeague(
		@Body() updateLeague: UpdateLeagueDto,
		@UserReq() user: User | null,
	) {
		this.userCanAccessResource(user, updateLeague.resource_id);
		const updatedLeague = await this.leagueService.updateLeague(updateLeague);

		return updatedLeague;
	}

	@ApiOperation({
		summary: `Remove an orcid id from the list of defaultMembers of a league in a specific resource`,
	})
	@Delete('remove-member')
	@AuthProtected()
	async removeMemberFromLeague(
		@Body() removeMemberFromLeague: DeleteMemberFromLeagueDTO,
		@UserReq() user: User | null,
	): Promise<LeagueEntity> {
		this.userCanAccessResource(user, removeMemberFromLeague.resource_id);

		const updatedResource = await this.resourceService.removeMemberFromLeague(
			removeMemberFromLeague,
		);

		return updatedResource.getLeague(
			removeMemberFromLeague.league,
		) as LeagueEntity;
	}

	@Delete()
	@AuthProtected()
	async deleteLeague(
		@Body() deleteLeague: DeleteLeagueDTO,
		@UserReq() user: User | null,
	): Promise<PartnerResourceEntity> {
		this.userCanAccessResource(user, deleteLeague.resource_id);

		const updatedResource = await this.resourceService.deleteLeague(
			deleteLeague,
		);

		delete updatedResource._id;

		return updatedResource.toObject() as PartnerResourceEntity;
	}
}
