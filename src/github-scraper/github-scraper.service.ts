import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { firstValueFrom } from 'rxjs';
import { throwError } from 'src/util/error.utils';
@Injectable()
export class GithubScraperService {
	// Add your methods and properties here

	constructor(protected http: HttpService) {}
	async getProfilePage(profileName: string) {
		const profileResponse = await firstValueFrom(
			this.http.get(`https://github.com/${profileName}`),
		);

		if (profileResponse.status >= 400) {
			throw new NotFoundException(
				`Profile with name ${profileName} not found in github`,
			);
		}

		const profilePage = profileResponse.data as string;

		const $ = cheerio.load(profilePage);

		const $foundOrcidTags = $('a[href^="https://orcid.org"]');
		if ($foundOrcidTags.length < 1) {
			throw new NotFoundException(
				`Profile with name ${profileName} has no linked ORCID ID`,
			);
		}
		const orcidTag =
			$foundOrcidTags.length == 1 ? $foundOrcidTags : $foundOrcidTags.first();

		const orcidHref =
			orcidTag.prop('href') ?? throwError(Error, 'ORCID link not found');

		const orcidUrl = new URL(orcidHref);

		const profileOrcidId = orcidUrl.pathname.slice(1);

		return {
			orcid_id: profileOrcidId,
			orcidUrl: orcidHref,
		};
	}
}
