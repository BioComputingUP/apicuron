import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { CuratorRegistryService } from './curator-registry.service';
import { GetRegistryEntryDto } from './dto/registry-entries.dto';
import { plainToInstance } from 'class-transformer';

import { paginate, Paginated } from 'src/pagination/paginator';
import { RegistrySearchResultDto } from './dto/registry-search-dto';
import {
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiHeader,
} from '@nestjs/swagger';
import { ApiResponsePaginated } from 'src/pagination/decorators/paginated-reponse.decorator';
import { VersionHeader } from 'src/plugins/swagger/config';

@ApiTags('Curator Registry')
@ApiHeader(VersionHeader)
@Controller({
	path: 'registry',
	version: '2',
})
export class CuratorRegistryController {
	constructor(protected registryService: CuratorRegistryService) {}

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
	
		try {
			const result = await this.registryService.getCuratorEntry(user_orcid);
			const desrialized_result = plainToInstance(
				RegistrySearchResultDto,
				result,
				{
					excludeExtraneousValues: true,
				},
			);
			return desrialized_result;
		} catch (error) {
			this.logger.error(error);
		}
	}

	@ApiOperation({
		summary: 'Get all curator entries based on the provided filters',
	})
	@ApiResponsePaginated(
		RegistrySearchResultDto,
		200,
		'List of curators and their resources and groups they contribute to ',
	)
	@Get()
	async getAllEntries(
		@Query() query: GetRegistryEntryDto,
	): Promise<Paginated<RegistrySearchResultDto>> | null {
		// const getStatDtoInstance = plainToInstance(GetRegistryEntryDto, query);
		const getStatDtoInstance = query
		try {
			const { data, length } = await this.registryService.getAllEntries(
				getStatDtoInstance,
			);
			const responseInstance = plainToInstance(RegistrySearchResultDto, data, {
				excludeExtraneousValues: true,
			});

			return paginate<RegistrySearchResultDto>(
				responseInstance,
				getStatDtoInstance,
				length,
			);
		} catch (error) {
			this.logger.error(error);
		}
	}
}
