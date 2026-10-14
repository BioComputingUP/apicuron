import {
	Controller,
	Get,
	Inject,
	Query,
	Req,
	UnauthorizedException,
} from '@nestjs/common';
import { GithubScraperService } from './github-scraper.service';
import { Request } from 'express';
import {
	GithubScraperModuleOptions,
	MODULE_OPTIONS_TOKEN,
} from './github-scraper.providers';

@Controller('fetch-orcid')
export class GithubScraperController {
	private token: string;
	private headerVal: string;
	constructor(
		private readonly githubDataFetcherService: GithubScraperService,
		@Inject(MODULE_OPTIONS_TOKEN) private options: GithubScraperModuleOptions,
	) {
		this.token = this.options.github_token;
		this.headerVal = `tokenKey ${this.token}`;
	}
	@Get()
	async getScraperData(
		@Query('profileName') githubProfileName: string,
		@Req() request: Request,
	): Promise<{ orcid_id: string; orcidUrl: string }> {
		if (
			!request.headers.authorization ||
			request.headers.authorization != this.headerVal
		) {
			throw new UnauthorizedException(
				`You are not authorized to use this endpoint`,
			);
		}
		const result = await this.githubDataFetcherService.getProfilePage(
			githubProfileName,
		);

		return result;
	}
}
