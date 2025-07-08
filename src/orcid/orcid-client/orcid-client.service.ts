import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import Bottleneck from 'bottleneck';
import { get } from 'lodash';
import {
	UserEmployment,
	UserLinks,
} from 'src/core/schemas/components/user-fields.schema';
import { inspect } from 'util';
import { OrcidApiUrl } from './constants';
import { orcidWorkXmlSerializer } from './helpers/orcid-work-serializer';
import { parseDateObjectIntoString } from './helpers/utils';
import {
	OrcidEmailEntry,
	OrcidUser,
	OrcidUserInfo,
	OrcidWork,
	SubmitWorkResponse,
} from './interfaces/orcid.interface';
import { OrcidTokenAuthService } from './token-auth.service';
@Injectable()
export class OrcidClientService {
	constructor(
		protected httpService: HttpService,
		@Inject(OrcidApiUrl) protected orcidUrl: string,
		protected tokenAuth: OrcidTokenAuthService,
	) {}
	private orcid_rate_limit = 20; // ORCID API rate limit is 24, set it to 20 to be safe
	private limiter = new Bottleneck({
		maxConcurrent: 1, // ensure 1 reqeust at a time,
		minTime: 1000 / this.orcid_rate_limit,
	});
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
					Authorization: `Bearer ${token?.access_token}`,
					Accept: 'application/orcid+json',
				},
				validateStatus: () => true,
			},
		);

		return response;
	}

	async get_user_info(orcid_id: string): Promise<OrcidUserInfo> {
		// Gets user biography, keywords, affiliation, and social links from Orcid
		const requestUrl = `${this.orcidUrl}${orcid_id}/record`;
		try {
			const userRecord = await this.limiter.schedule(
				{ id: `request-${orcid_id}` },
				async () =>
					this.httpService.axiosRef.get(requestUrl, {
						headers: {
							Authorization: `Bearer ${
								(
									await this.tokenAuth.getToken()
								).access_token
							}`,
							Accept: 'application/vnd.orcid+json',
						},
					}),
			);
			this.logger.debug(
				`← Received response with status ${userRecord.status} for ${orcid_id}`,
			);

			const data = userRecord?.data;

			return this.processOrcidUserInfo(data, orcid_id);
		} catch (error) {
			this.logger.error(`Error Getting info from Orcid for: ${orcid_id} ! `);
			this.logger.error(error);
		}
	}

	private processOrcidUserInfo(data: any, orcid_id: string): OrcidUserInfo {
		const user_bio: string = get(data, 'person.biography.content', null);

		const user_keywords: string[] = get(
			data,
			'person.keywords.keyword',
			[],
		).map((k) => k.content);

		// for now affiliation is the most recent employment.
		const user_affiliation: string = get(
			data,
			'activities-summary.employments.affiliation-group[0].summaries[0].employment-summary.organization.name',
			null,
		);

		const user_links: UserLinks[] = get(
			data,
			'person.researcher-urls.researcher-url',
			[],
		)
			.map((link) => {
				const url_name = get(link, 'url-name', null);
				const url_value = get(link, 'url.value', null) as URL;
				if (!url_name || !url_value) {
					return null;
				}
				return {
					name: url_name,
					url: url_value,
				};
			})
			.filter((link) => !!link && link.url);

		const user_employment: UserEmployment[] = get(
			data,
			'activities-summary.employments.affiliation-group',
			[],
		)
			.map((affiliation) => {
				const summary = get(
					affiliation,
					'summaries[0].employment-summary',
					null,
				);
				if (!summary) return null;

				const org_name = get(summary, 'organization.name', undefined);
				const role_title = get(summary, 'role-title', undefined);
				const org_url = get(summary, 'url.value', undefined);
				const start_date = parseDateObjectIntoString(
					get(summary, 'start-date', undefined),
				);
				const end_date = parseDateObjectIntoString(
					get(summary, 'end-date', undefined),
				);

				if (!org_name) return null;
				return {
					name: org_name,
					title: role_title,
					url: org_url,
					start_date: start_date,
					end_date: end_date,
				};
			})
			.filter(Boolean);
		return {
			orcid_id,
			biography: user_bio,
			keywords: user_keywords,
			affiliation: user_affiliation,
			links: user_links,
			user_employment: user_employment,
		};
	}
}
