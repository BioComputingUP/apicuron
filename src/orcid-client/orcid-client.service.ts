import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { OrcidApiUrl } from './constants';
import {
	OrcidEmailEntry,
	OrcidUser,
	OrcidWork,
} from './interfaces/orcid.interface';
import { buildExternalId } from './helpers/build-external-id';

@Injectable()
export class OrcidClientService {
	constructor(
		protected httpService: HttpService,
		@Inject(OrcidApiUrl) protected orcidUrl: string,
	) {}
	logger = new Logger(OrcidClientService.name);

	async loadUserEmail(user: OrcidUser): Promise<OrcidEmailEntry[] | null> {
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

	async submitWork(user: OrcidUser, orcidWork: OrcidWork): Promise<string> {
		const { externalIds, title, shortDescription, type } = orcidWork;
		const putCode = orcidWork.putCode ? `put-code="${orcidWork.putCode}"` : '';

		const processedExternalIds = externalIds.map(buildExternalId).join('\n');

		const rawData = `
		<?xml version="1.0" encoding="UTF-8"?>
		<work:work
			xmlns:common="http://www.orcid.org/ns/common" xmlns:work="http://www.orcid.org/ns/work"
			xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
			xsi:schemaLocation="http://www.orcid.org/ns/work /work-3.0.xsd"
			${putCode}>	
			<work:title>
				<common:title>${title}</common:title>
			</work:title>
			<work:short-description>${shortDescription}</work:short-description>
			<work:type>${type}</work:type>
			<common:external-ids>
			${processedExternalIds}
			</common:external-ids>
		</work:work>
		`;

		const url = `${this.orcidUrl}${user.orcid_id}/work/${putCode}`;

		const response = await this.httpService.axiosRef.put(url, rawData.trim(), {
			headers: {
				Accept: '*/*',
				'Content-type': 'application/vnd.orcid+xml',
				Authorization: `Bearer ${user.orcid_permission}`,
			},
		});

		if (response.status < 200 || response.status >= 400) {
			if (response.status == 409) {
				// a conflict, work already exists but we do not have the put-code
				this.logger.error(
					`User ${user.orcid_id} has no put-code but work creation failed on code 409`,
				);
				this.logger.error(`response headers:\n${response.headers}`);
				this.logger.error(`response data:\n${response.data}`);
				throw new Error(
					`Failed to submit work ${title} for user ${user.orcid_id} \n Missing ORCID Put Code`,
				);
			}
			this.logger.error(`Error Status ${response.status}`);
			this.logger.error(`Error Response Header ${response.headers}`);
			this.logger.error(`Error Response Body ${response.data}`);
			throw new Error(
				`Failed to submit work ${title} for user ${user.orcid_id}`,
			);
		}

		if (response.status == 201) {
			// Work added successfully, we retrieve the put-code
			const splitUrl = response.headers.location.split('/');

			const retrievedPutCode = splitUrl[splitUrl.length - 1];
			return retrievedPutCode;
		}
	}
}
