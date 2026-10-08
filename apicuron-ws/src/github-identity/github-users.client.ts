import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GithubUsersClient {
	private readonly logger = new Logger(GithubUsersClient.name);
	private readonly token?: string;

	constructor(
		private readonly http: HttpService,
		config: ConfigService,
	) {
		this.token = config.get<string>('GITHUB_TOKEN') || undefined;
	}

	/** Numeric ID of a GitHub user account; null if the login doesn't exist or is an organisation. */
	async findUserId(login: string): Promise<string | null> {
		const response = await this.getUser(login, true);
		if (response.status === 404) return null;
		if (response.status !== 200) {
			throw new Error(`GitHub responded ${response.status} for login "${login}"`);
		}
		return response.data.type === 'User' ? String(response.data.id) : null; // remove orgs, bots. .tc
	}

	private async getUser(login: string, withToken: boolean): Promise<AxiosResponse> {
		const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
		if (withToken && this.token) headers.Authorization = `Bearer ${this.token}`;

		const response = await firstValueFrom(
			this.http.get(`https://api.github.com/users/${encodeURIComponent(login)}`, {
				headers,
				validateStatus: () => true, // handle every status here instead of throwing
			}),
		);

		// Token rejected or rate-limited: fall back to an unauthenticated call (60 per hour)
		if (withToken && this.token && (response.status === 401 || response.status === 403)) {
			this.logger.warn(`GitHub token failed with ${response.status}; retrying without token`);
			return this.getUser(login, false);
		}
		return response;
	}
}