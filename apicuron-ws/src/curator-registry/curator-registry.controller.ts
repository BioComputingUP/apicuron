import { Controller, Get, Logger, NotFoundException, Param, Query, SerializeOptions } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { GetRegistryEntryDto } from './dto/registry-entries.dto';

import {
	ApiExtraModels, ApiHeader, ApiOkResponse,
	ApiOperation,
	ApiTags
} from '@nestjs/swagger';
import { UserReq } from 'src/auth/decorators/applyUser.decorator';
import { AuthProtected } from 'src/auth/decorators/auth.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { User } from 'src/core/schemas/user.schema';
import { ApiResponsePaginated } from 'src/pagination/decorators/paginated-reponse.decorator';
import { paginate, Paginated } from 'src/pagination/paginator';
import { VersionHeader } from 'src/plugins/swagger/config';
import { RegistryCurator } from './dto/registry-curator-dto';
import { RegistrySearchResultDto } from './dto/registry-search-dto';
import { RegistryQueryService } from './services/registry-query.service';

@ApiTags('Curator Registry')
@ApiHeader(VersionHeader)
@Controller({
	path: 'registry',
	version: '2',
})
@ApiExtraModels(RegistrySearchResultDto, RegistryCurator)
export class CuratorRegistryController {
	constructor(protected registryQueryService: RegistryQueryService) { }

	private logger = new Logger(CuratorRegistryController.name);
	@ApiOkResponse({
		description:
			'List of curators and their resources and groups they contribute to',
	})
	@ApiOperation({
		summary:
			'Get a single curator entry from the registry based on their orcid id',
	})
	@Get('curator/:id')
	async getCuratorEntry(
		@Param('id') user_orcid: string,
	): Promise<RegistrySearchResultDto> {

			const result = await this.registryQueryService.findCuratorEntryByOrcid(user_orcid);
			if (!result){
				throw new NotFoundException(`Contributor with ORCID ${user_orcid} not found`);
			}
			const deserialized_result = plainToInstance(
				RegistrySearchResultDto,
				result,
				{
					excludeExtraneousValues: true,
				},
			);
			return deserialized_result;
	}

	@ApiOperation({
		summary: 'Get all curator entries based on the provided filters',
	})
	@ApiResponsePaginated(
		RegistrySearchResultDto,
		200,
		'List of curators and their resources and groups they contribute to ',
	)
	// eslint-disable-next-line prettier/prettier
	@SerializeOptions({ type: Paginated<RegistrySearchResultDto> })
	@AuthProtected()
	@Public()
	@Get()
	async getAllEntries(
		@Query() query: GetRegistryEntryDto,
		@UserReq() user: User | null,
	): Promise<Paginated<RegistrySearchResultDto>>  {
		const userAdministeredResourceIds: string[] = user ? user.resources.map(resource => resource.resource_id) : [];
		const { data, total } = await this.registryQueryService.getAllEntries(
			query,
			userAdministeredResourceIds
		);

		return paginate<RegistrySearchResultDto>(RegistrySearchResultDto,
			data,
			query,
			total,
		);
	}
}
