import { Controller, Get, Logger, NotFoundException, Param, Query, SerializeOptions } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CuratorRegistryService } from './curator-registry.service';
import { GetRegistryEntryDto } from './dto/registry-entries.dto';

import {
	ApiExtraModels, ApiHeader, ApiOkResponse,
	ApiOperation,
	ApiTags
} from '@nestjs/swagger';
import { ApiResponsePaginated } from 'src/pagination/decorators/paginated-reponse.decorator';
import { paginate, Paginated } from 'src/pagination/paginator';
import { VersionHeader } from 'src/plugins/swagger/config';
import { RegistryCurator } from './dto/registry-curator-dto';
import { RegistrySearchResultDto } from './dto/registry-search-dto';

@ApiTags('Curator Registry')
@ApiHeader(VersionHeader)
@Controller({
	path: 'registry',
	version: '2',
})
@ApiExtraModels(RegistrySearchResultDto, RegistryCurator)
export class CuratorRegistryController {
	constructor(protected registryService: CuratorRegistryService) { }

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
		
			const result = await this.registryService.getCuratorEntry(user_orcid);
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
	@SerializeOptions({ type: Paginated<RegistrySearchResultDto> })
	@Get()
	async getAllEntries(
		@Query() query: GetRegistryEntryDto,
	): Promise<Paginated<RegistrySearchResultDto>>  {
		// const getStatDtoInstance = plainToInstance(GetRegistryEntryDto, query);
		const getStatDtoInstance = query;
		const { data, total } = await this.registryService.getAllEntries(
			getStatDtoInstance,
		);

		return paginate<RegistrySearchResultDto>(RegistrySearchResultDto,
			data,
			getStatDtoInstance,
			total,
		);
	}
}
