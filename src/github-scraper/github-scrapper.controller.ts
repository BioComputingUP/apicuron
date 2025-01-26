import {
	Controller,
	Get,
	Query,
	Req,
	UnauthorizedException,
} from '@nestjs/common';
import { GithubScraperService } from './github-scraper.service';
import { Request } from 'express';

@Controller('fetch-orcid')
export class OrcidFetcherController {
	constructor(
		private readonly githubDataFetcherService: GithubScraperService,
	) {}
	token =
		'***REMOVED***';
	headerVal = `tokenKey ${this.token}`;
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
