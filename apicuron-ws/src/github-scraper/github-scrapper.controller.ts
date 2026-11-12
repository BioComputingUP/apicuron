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
	private headerVal?: string;
	constructor(
		private readonly githubDataFetcherService: GithubScraperService,
		@Inject(MODULE_OPTIONS_TOKEN) private options: GithubScraperModuleOptions,
	) {
		// without a configured token, no request is authorized
		this.headerVal = this.options.github_token
			? `tokenKey ${this.options.github_token}`
			: undefined;
	}
	@Get()
	async getScraperData(
		@Query('profileName') githubProfileName: string,
		@Req() request: Request,
	): Promise<{ orcid_id: string; orcidUrl: string }> {
		if (
			!this.headerVal ||
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
