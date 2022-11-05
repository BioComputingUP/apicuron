import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Strategy } from 'passport-orcid';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users/users.service';
@Injectable()
export class OrcidStrategy extends PassportStrategy(Strategy, 'orcid') {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private usersService: UsersService
  ) {
    super(
      {
        sandbox: true,
        callbackURL: configService.get<string>('ORCID_REDIRECT'),
        clientID: configService.get<string>('ORCID_CLIENT_ID'),
        clientSecret: configService.get<string>('ORCID_CLIENT_SECRET'),
      },

      async function (accessToken, refreshToken, params, profile, done) {

        // Verify access params.id contains the orcid
        const orcid_id: string = params.orcid;
        const user = { orcid_id, username: params.name }

        usersService.upsert_user(orcid_id, {
          // displayed Name obtained from orcid
          displayedName: params.name,
          orcid_id,
          // orcid_permission authorization token for updating a user information (/works)
          orcid_permission: params.scope === '/activities/update' ? params.access_token : undefined,
        });

        done(null, user);
      },
    );
  }
}
