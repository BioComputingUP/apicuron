import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { OrcidApiUrl } from './constants';
import {
	OrcidEmailEntry,
	OrcidUser,
	OrcidWork,
	SubmitWorkResponse,
} from './interfaces/orcid.interface';
import { inspect } from 'util';
import { OrcidTokenAuthService } from './token-auth.service';
import { orcidWorkXmlSerializer } from './helpers/orcid-work-serializer';

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

	/**
	 * Submits a work to the ORCID API for a given user.
	 *
	 * @param user - The ORCID user for whom the work is being submitted.
	 * @param orcidWork - The work details to be submitted.
	 * @returns A promise that resolves to a SubmitWorkResponse object containing the status and put-code if applicable.
	 *
	 * @throws Will throw an error if the submission fails with a status code outside the range of 200-399.
	 *
	 * The function performs the following steps:
	 * 1. Extracts necessary fields from the orcidWork object.
	 * 2. Constructs the XML payload for the ORCID API request.
	 * 3. Determines the appropriate URL path and HTTP method (POST or PUT) based on the presence of a put-code.
	 * 4. Sends the request to the ORCID API using axios.
	 * 5. Handles the response, including retrying the request if a conflict (409) occurs and the put-code is missing.
	 * 6. Logs relevant information and errors.
	 * 7. Returns the status and put-code if the submission is successful.
	 */
	async submitWork(
		user: OrcidUser,
		orcidWork: OrcidWork,
	): Promise<SubmitWorkResponse> {
		const { title } = orcidWork;

		const rawData = orcidWorkXmlSerializer(orcidWork);

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
				this.logger.error(response.data, null, response.status);

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
					`Failed to submit work "${title}" for user ${user.orcid_id} \n Missing ORCID Put Code`,
				);
			}
			this.logger.error(`Error Status ${response.status}`);
			this.logger.error(`Error Response Header ${inspect(response.headers)}`);
			this.logger.error(`Error Response Body ${inspect(response.data)}`);
			throw new Error(
				`Failed to submit work "${title}" for user ${user.orcid_id}`,
			);
		}

		this.logger.log(
			`Work "${title}" submitted successfully, status: ${response.status}`,
		);

		if (response.status == 201) {
			// Work added successfully, we retrieve the put-code
			const splitUrl = response.headers.location.split('/');

			const retrievedPutCode = splitUrl[splitUrl.length - 1];
			return { status: response.status, putCode: retrievedPutCode };
		}

		return { status: response.status };
	}

	// async submitWorks(user: OrcidUser, orcidWorks: OrcidWork[]) {
	// 	if (orcidWorks.length == 0) {
	// 		throw new Error(`No works to submit for user ${user.orcid_id}`);
	// 	}
	// 	if (orcidWorks.length == 1) {
	// 		this.logger.warn(
	// 			`Only one work to submit for user ${user.orcid_id}, called submitWorks! instead of submitWork`,
	// 		);
	// 		return await this.submitWork(user, orcidWorks[0]);
	// 	}

	// 	const rawData = orcidBulkWorkXmlSerializer(orcidWorks);
	// 	// Serialize the works into the ORCID JSON format

	// 	const options = {
	// 		method: 'POST',
	// 		url: this.orcidUrl + urlPath,
	// 		headers: {
	// 			'Content-Type': 'application/json',
	// 			Authorization: 'Bearer ' + user.orcid_permission,
	// 			Accept: '*/*',
	// 		},
	// 		data: rawData.trim(),
	// 		validateStatus: function (status) {
	// 			return status < 500; // Resolve only if the status code is less than 500
	// 		},
	// 	};
	// }

	async expandedSearch(solrQuery: string) {
		const token = await this.tokenAuth.getToken();
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

	async get_user_info(orcid_id: string) {
		// Gets user biography, keywords, affiliation, and social links from Orcid
		const requestUrl = `${this.orcidUrl}${orcid_id}/record`;
		try {
			const userRecord = await this.httpService.axiosRef.get(requestUrl, {
				headers: {
					Authorization: `Bearer ${
						(
							await this.tokenAuth.getToken()
						).access_token
					}`,
					Accept: 'application/vnd.orcid+json',
				},
			});

			// console.log(userRecord);
			const userBio: string = userRecord?.data?.person?.biography?.content;
			const userKeywords: string[] =
				userRecord?.data?.person?.keywords.keyword.map(
					(keyword) => keyword.content,
				);
			const userAffiliation: string =
				userRecord?.data?.['activities-summary']?.employments[
					'affiliation-group'
				]?.[0]?.summaries?.[0]?.['employment-summary'].organization?.name;
			const userLinks: { name: string; url: URL } = userRecord?.data?.person?.[
				'researcher-urls'
			]?.['researcher-url'].map((link) => {
				return {
					name: link?.['url-name'],
					url: new URL(link?.url?.value),
				};
			});
			return {
				orcid_id,
				biography: userBio,
				keywords: userKeywords,
				affiliation: userAffiliation,
				links: userLinks,
			};
		} catch (error) {
			this.logger.error(`Error Getting info from Orcid for: ${orcid_id} ! `);
			this.logger.error(error);
		}
	}
}
