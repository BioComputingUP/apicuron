import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { CuratorRegistryService } from './curator-registry.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { RegistryEntriesDto } from './dto/registry-entries.dto';
import { plainToInstance } from 'class-transformer';

import { UserReq } from 'src/auth/decorators/applyUser.decorator';
import { User } from 'src/core/schemas/user.schema';
import { userResourceEntityPrivacyFilter } from 'src/util/privacy.helper';

@Controller('curator-registry')
export class CuratorRegistryController {
	constructor(protected registryService: CuratorRegistryService) {}

	private logger = new Logger(CuratorRegistryController.name);

	@Get('all')
	async getAllEntries(@Query() query: RegistryEntriesDto, 		
	@UserReq() user: User) {
		const getStatDtoInstance = plainToInstance(RegistryEntriesDto, query);
		const request_orcid= (!user)? "":user.orcid_id;
		try {
			const result = await this.registryService.getAllEntries(
				getStatDtoInstance,
				request_orcid
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
