import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { GithubIdentitySyncService } from 'src/github-identity/github-identity-sync.service';
import { OrcidClientService } from 'src/orcid/orcid-client/orcid-client.service';
import { AuthService } from '../auth.service';
import { UsersService } from '../users/services/users.service';

const orcid_scopes = '/read-limited /activities/update';

@Injectable()
export class OrcidStrategy extends PassportStrategy(Strategy, 'orcid') {
	constructor(
		authService: AuthService,
		configService: ConfigService,
		usersService: UsersService,
		protected httpService: HttpService,
		protected orcid_client: OrcidClientService,
		protected githubIdentitySync: GithubIdentitySyncService
	) {
		const logger = new Logger(OrcidStrategy.name);
		super(
			{
				authorizationURL: configService.get<string>('ORCID_AUTH_URL'),
				tokenURL: configService.get<string>('ORCID_TOKEN_URL'),
				callbackURL: configService.get<string>('ORCID_REDIRECT'),
				clientID: configService.get<string>('ORCID_CLIENT_ID'),
				clientSecret: configService.get<string>('ORCID_CLIENT_SECRET'),
				scope: orcid_scopes,
			},

			async function (accessToken, refreshToken, params, profile, done) {
				const orcid_id: string = params.orcid;
				try {
					const user_info = await orcid_client.get_user_info(orcid_id);
					const user = await usersService.createOrUpdateUser({
						displayedName: params.name,
						username: params.name,
						orcid_id,
						// orcid_permission authorization token for updating a user information (/works)
						orcid_permission: accessToken ?? params.access_token,
						orcid_scope: params.scope,
						refresh_token: refreshToken,
						// fetched user info
						biography: user_info.biography ?? undefined,
						keywords: user_info.keywords,
						affiliation: user_info.affiliation ?? undefined,
						employment: user_info.user_employment,
						links: user_info.links,
					});
					// not awaited on purpose to avoid blocking login
					void githubIdentitySync
						.syncUser(orcid_id)
						.catch((e) =>
							logger.warn(`GitHub identity sync failed for ${orcid_id}: ${e}`),
						);
					done(null, user);
				} catch (error) {
					logger.error(`Error Orcid Oauth for user ${orcid_id} ! `);
					logger.error(error);
					done(error, null);
				}
			},
		);
	}
}
