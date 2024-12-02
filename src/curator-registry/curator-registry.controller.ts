import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { CuratorRegistryService } from './curator-registry.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { RegistryEntriesDto } from './dto/registry-entries.dto';
import { plainToInstance } from 'class-transformer';

@Controller('curator-registry')
export class CuratorRegistryController {
	constructor(protected registryService: CuratorRegistryService) {}

	private logger = new Logger(CuratorRegistryController.name);

	@Get('all')
	async getAllEntries(@Query() query: RegistryEntriesDto) {
		const getStatDtoInstance = plainToInstance(RegistryEntriesDto, query);
		this.logger.debug(`Query: ${JSON.stringify(getStatDtoInstance)}`);
		try {
			const result = await this.registryService.getAllEntries(
				getStatDtoInstance,
			);
			return { length: result.length, data: result };
		} catch (error) {
			this.logger.error(error);
		}
	}

	@Get('curator/:id')
	async getCuratorEntry(@Param('id') user_orcid: string) {
		// test request: http://localhost:3000/api/curator-registry/curator/0000-0002-2472-5685
		this.logger.debug(`getCuratorEntry: ${user_orcid}`);
		try {
			const result = await this.registryService.getCuratorEntry(user_orcid);
			return result;
		} catch (error) {
			this.logger.error(error);
		}
	}

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
