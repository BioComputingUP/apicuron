import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
	OrcidAuthToken,
	OrcidClientModuleOptions,
} from './interfaces/orcid.interface';
import { MODULE_OPTIONS_TOKEN } from './orcid-client-module-options';
@Injectable()
export class OrcidTokenAuthService implements OnModuleInit {
	constructor(
		@Inject(MODULE_OPTIONS_TOKEN) protected options: OrcidClientModuleOptions,
		protected http: HttpService,
	) {}
	private logger = new Logger(OrcidTokenAuthService.name);

	private token: OrcidAuthToken | null = null;

	async onModuleInit() {
		if (this.options.loadOnStartup) {
			await this.fetchToken();
		}
	}

	private async fetchToken() {
		const response = await this.http.axiosRef.post(
			new URL('/oauth/token', this.options.apiUrl).href,
			`client_id=${this.options.client_id}&client_secret=${this.options.client_secret}&scope=/read-public&grant_type=client_credentials`,
			{
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				validateStatus: () => true,
			},
		);

		if (response.status > 400) {
			this.logger.error(
				`${response.status}:${response.data.error}${response.data.error_description}`,
				null,
				'Failed to retrieve ORCID API credentials',
			);
			return;
		}

		const tokenObj = response.data;
		tokenObj.expires_at = Date.now() + tokenObj.expires_in;
		const token = tokenObj as OrcidAuthToken;

		this.token = token;
		return token;
	}

	async getToken(): Promise<OrcidAuthToken | undefined> {
		if (!this.token || Date.now() + 10 * 1000 >= this.token?.expires_at) {
			return await this.fetchToken();
		}
		return this.token;
	}
}
