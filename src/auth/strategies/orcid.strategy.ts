import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { Strategy } from 'passport-oauth2';
import { UsersService } from '../users/users.service';
import { plainToInstance } from 'class-transformer';
import { CreateOrUpdateUserDto } from '../users/dto/create-or-update-user.dto';

const orcid_scopes = '/read-limited /activities/update';

@Injectable()
export class OrcidStrategy extends PassportStrategy(Strategy, 'orcid') {
	constructor(
		authService: AuthService,
		configService: ConfigService,
		usersService: UsersService,
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
				// const user = { orcid_id, username: params.name };
				// console.log({ params });
				try {
					const user = await usersService.createOrUpdateUser({
						// displayed Name obtained from orcid
						displayedName: params.name,
						username: params.name,
						orcid_id,
						// orcid_permission authorization token for updating a user information (/works)
						orcid_permission: accessToken ?? params.access_token,
						orcid_scope: params.scope,

						refresh_token: refreshToken,
					});

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
