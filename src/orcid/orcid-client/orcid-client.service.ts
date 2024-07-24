import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OrcidApiUrl } from './constants';
import {
	OrcidEmailEntry,
	OrcidUser,
	OrcidWork,
	SubmitWorkResponse,
} from './interfaces/orcid.interface';
import { buildExternalId } from './helpers/build-external-id';
import { inspect } from 'util';
import { OrcidTokenAuthService } from './token-auth.service';

@Injectable()
export class OrcidClientService {
	constructor(
		protected httpService: HttpService,
		@Inject(OrcidApiUrl) protected orcidUrl: string,
		protected tokenAuth: OrcidTokenAuthService,
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

	async submitWork(
		user: OrcidUser,
		orcidWork: OrcidWork,
	): Promise<SubmitWorkResponse> {
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

		const urlPath = orcidWork.putCode
			? `${user.orcid_id}/work/${orcidWork.putCode}`
			: `${user.orcid_id}/work/`;

		this.logger.debug(`URL:  ${urlPath}`);

		const options = {
			method: orcidWork.putCode ? 'PUT' : 'POST',
			url: this.orcidUrl + urlPath,
			headers: {
				'Content-Type': 'application/xml',
				Authorization: 'Bearer ' + user.orcid_permission,
				Accept: '*/*',
			},
			data: rawData.trim(),
			validateStatus: function (status) {
				return status < 500; // Resolve only if the status code is less than 500
			},
		};

		const response = await this.httpService.axiosRef.request(options);

		if (response.status < 200 || response.status >= 400) {
			if (response.status == 409) {
				// a conflict, work already exists but we do not have the put-code
				this.logger.error(
					`User ${user.orcid_id} has no put-code but work creation failed on code 409`,
				);

				// retry attempt, by retrieving the code from the response message
				const putCodeMatch = response.data.toString().match(/put-code (\d+)/);
				if (putCodeMatch && putCodeMatch.length > 1) {
					// retry attempt
					const response = await this.submitWork(user, {
						...orcidWork,
						putCode: putCodeMatch[1],
					});
					// if response is successful, return the validated put-code
					if (response.status >= 200 && response.status < 400) {
						return {
							status: 201,
							putCode: putCodeMatch[1],
						};
					}
				}

				throw new Error(
					`Failed to submit work ${title} for user ${user.orcid_id} \n Missing ORCID Put Code`,
				);
			}
			this.logger.error(`Error Status ${response.status}`);
			this.logger.error(`Error Response Header ${inspect(response.headers)}`);
			this.logger.error(`Error Response Body ${inspect(response.data)}`);
			throw new Error(
				`Failed to submit work ${title} for user ${user.orcid_id}`,
			);
		}

		this.logger.log(
			`Work ${title} submitted successfully, status: ${response.status}`,
		);

		if (response.status == 201) {
			// Work added successfully, we retrieve the put-code
			const splitUrl = response.headers.location.split('/');

			const retrievedPutCode = splitUrl[splitUrl.length - 1];
			return { status: response.status, putCode: retrievedPutCode };
		}

		return { status: response.status };
	}

	async expandedSearch(solrQuery: string) {
		const token = await this.tokenAuth.getToken();
		this.logger.debug(`Orcid API URL: ${this.orcidUrl}`);
		const response = await this.httpService.axiosRef.get(
			`${this.orcidUrl}expanded-search`,
			{
				params: {
					q: solrQuery,
					rows: 20,
				},
				headers: {
					Authorization: `Bearer ${token.access_token}`,
					Accept: 'application/orcid+json',
				},
				validateStatus: () => true,
			},
		);

		return response;
	}
}
