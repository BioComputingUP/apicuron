import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { OrcidApiUrl } from './constants';
import { log } from 'console';
import { OrcidEmailEntry } from './interfaces/orcid-email.interface';

@Injectable()
export class OrcidClientService {
	constructor(
		protected httpService: HttpService,
		@Inject(OrcidApiUrl) protected orcidUrl: string,
	) {}
	logger = new Logger(OrcidClientService.name);

	async loadUserEmail(user: {
		orcid_id: string;
		orcid_permission: string;
	}): Promise<OrcidEmailEntry[] | null> {
		const emailUrl = `${this.orcidUrl}${user.orcid_id}/email`;
		const response = await this.httpService.axiosRef.get(emailUrl, {
			headers: {
				Authorization: `Bearer ${user.orcid_permission}`,
				Accept: 'application/vnd.orcid+json',
			},
		});
		if (response.status < 200 || response.status >= 400) {
			this.logger.error(`Error Status ${response.status}`);
			this.logger.error(`Error Response Header ${response.headers}`);
			this.logger.error(`Error Response Body ${response.data}`);
			throw new Error(`Error Retrieving Email for user ${user.orcid_id}`);
		}

		const data = response.data;
		if (!data || !data.email || !data.email.length) {
			return null;
		}
		const emails = data.email;
		const emailsData: OrcidEmailEntry[] = [];

		for (const emailEntry of emails) {
			const emailData = {
				email: emailEntry.email,
				primary: emailEntry.primary,
				verified: emailEntry.verified,
				visibility: emailEntry.visibility,
			} as OrcidEmailEntry;

			emailsData.push(emailData);
		}

		return emailsData;
	}
}
