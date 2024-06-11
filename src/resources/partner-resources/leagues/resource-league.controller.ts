import {
	Body,
	Controller,
	Delete,
	ForbiddenException,
	Get,
	NotFoundException,
	Param,
	Post,
} from '@nestjs/common';
import { AuthProtected } from '../../../auth/decorators/auth.decorator';
import { Public } from '../../../auth/decorators/public.decorator';
import { UserReq } from '../../../auth/decorators/applyUser.decorator';
import { User } from '../../../core/schemas/user.schema';
import { PartnerResourcesService } from '../services/partner-resources.service';
import { PrivacyType } from '../../../core/enums';
import { VersionHeader } from '../../../swagger/config';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateLeagueDto } from '../dto/create-league.dto';
import { AddMemberToLeagueDTO } from '../dto/add-member-to-league';
import { DeleteMemberFromLeagueDTO } from '../dto/delete-from-league.dto';
import { DeleteLeagueDTO } from '../dto/delete-league.dto';

@ApiTags('Leagues')
@ApiHeader(VersionHeader)
@Controller({ path: 'leagues', version: '2' })
export class ResourceLeagueController {
	constructor(protected resourceService: PartnerResourcesService) {}

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
	@Get(':resource_id')
	@AuthProtected()
	@Public()
	async getLeagues(
		@UserReq() user: User | null,
		@Param('resource_id') resourceId: string,
	) {
		const resource = await this.resourceService.get_resource(resourceId);
		if (!resource) {
			throw new NotFoundException(`Resource (${resourceId}) Not Found`);
		}
		if (
			!user ||
			!user.resources.map((r) => r.resource_id).includes(resourceId)
		) {
			return resource.leagues
				.filter((league) => league.visibility === PrivacyType.public)
				.map((league) => league.name);
		}
		return resource.leagues;
	}

	@ApiOperation({
		summary: 'Create a new league for a resource',
	})
	@Post()
	@AuthProtected()
	async createLeague(
		@Body() createLeague: CreateLeagueDto,
		@UserReq() user: User | null,
	) {
		this.userCanAccessResource(user, createLeague.resource_id);
		const league = await this.resourceService.createLeague(createLeague);
		return league;
	}

	@Post('add-member')
	@AuthProtected()
	async addMemberToLeague(
		@Body() addMemberToLeague: AddMemberToLeagueDTO,
		@UserReq() user: User | null,
	) {
		this.userCanAccessResource(user, addMemberToLeague.resource_id);

		const updatedResource = await this.resourceService.addMemberToLeague(
			addMemberToLeague,
		);

		return updatedResource.getLeague(addMemberToLeague.league);
	}

	@Delete('remove-member')
	@AuthProtected()
	async removeMemberFromLeague(
		@Body() removeMemberFromLeague: DeleteMemberFromLeagueDTO,
		@UserReq() user: User | null,
	) {
		this.userCanAccessResource(user, removeMemberFromLeague.resource_id);

		const updatedResource = await this.resourceService.removeMemberFromLeague(
			removeMemberFromLeague,
		);

		return updatedResource.getLeague(removeMemberFromLeague.league);
	}

	@Delete()
	@AuthProtected()
	async deleteLeague(
		@Body() deleteLeague: DeleteLeagueDTO,
		@UserReq() user: User | null,
	) {
		this.userCanAccessResource(user, deleteLeague.resource_id);

		const updatedResource = await this.resourceService.deleteLeague(
			deleteLeague,
		);

		delete updatedResource._id;

		return updatedResource.toObject();
	}
}
