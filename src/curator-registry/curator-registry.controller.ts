import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { CuratorRegistryService } from './curator-registry.service';
import { GetRegistryEntryDto } from './dto/registry-entries.dto';
import { plainToInstance } from 'class-transformer';

import { paginate, Paginated } from 'src/pagination/paginator';

@Controller({
	path: 'curator-registry',
	version: '2',
})
export class CuratorRegistryController {
	constructor(protected registryService: CuratorRegistryService) {}

	private logger = new Logger(CuratorRegistryController.name);

	@Get('')
	async getAllEntries(
		@Query() query: GetRegistryEntryDto,
	) : Promise<Paginated<any>> | null { //TODO: Add DTO
		const getStatDtoInstance = plainToInstance(GetRegistryEntryDto, query);
		try {
			const { data, length } = await this.registryService.getAllEntries(
				getStatDtoInstance,
			);
			return paginate(data, getStatDtoInstance, length);
		} catch (error) {
			this.logger.error(error);
		}
	}

	@Get('curator/:id')
	async getCuratorEntry(@Param('id') user_orcid: string) {
		this.logger.debug(`getCuratorEntry: ${user_orcid}`);
		try {
			const result = await this.registryService.getCuratorEntry(user_orcid);
			return result;
		} catch (error) {
			this.logger.error(error);
		}
	}
	// FIXME: remove this
	// dev test routes
	@Get('update-all')
	async updateAll() {
		this.registryService.recomputeAllEntries();
	}

	@Get('update')
	async updateAndReturnUser(@Query('id') user_orcid: string) {
		// this.logger.debug(user_orcid);
		try {
			const result = await this.registryService.updateCuratorEntry(user_orcid);
			return result;
		} catch (error) {
			this.logger.error(error);
		}
	}
	// catch all
	@Get()
	test() {
		return 'Did you request the correct route?';
	}
}
