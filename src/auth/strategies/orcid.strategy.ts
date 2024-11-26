import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { Strategy } from 'passport-oauth2';
import { UsersService } from '../users/services/users.service';
import { plainToInstance } from 'class-transformer';
import { CreateOrUpdateUserDto } from '../users/dto/create-or-update-user.dto';
import { HttpService } from '@nestjs/axios';
import { OrcidClientService } from 'src/orcid/orcid-client/orcid-client.service';



const orcid_scopes = '/read-limited /activities/update';

@Injectable()
export class OrcidStrategy extends PassportStrategy(Strategy, 'orcid') {
	constructor(
		authService: AuthService,
		configService: ConfigService,
		usersService: UsersService,
		protected httpService: HttpService,
		orcid_client: OrcidClientService
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
				// const requestUrl = `${configService.get<string>('ORCID_API_URL')}${orcid_id}/record`
				const user_info = await orcid_client.get_user_info(orcid_id)
				try {
					const user = await usersService.createOrUpdateUser({
						// displayed Name obtained from orcid
						displayedName: params.name,
						username: params.name,
						orcid_id,
						// orcid_permission authorization token for updating a user information (/works)
						orcid_permission: accessToken ?? params.access_token,
						orcid_scope: params.scope,
						// biography: params.content,
						refresh_token: refreshToken,
						biography: user_info.biography,
						keywords: user_info.keywords,
						affiliation: user_info.affiliation,
						links: user_info.links							
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
