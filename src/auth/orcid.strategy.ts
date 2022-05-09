import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { UsersService } from 'src/auth/users/users.service';
import { AuthService } from './auth.service';
import { Strategy } from 'passport-orcid';
// const Strategy = require('passport-orcid').Strategy;

// let orcidStrategy = new OrcidStrategy({
//     sandbox: config.get('ENV_NAME') === 'development',
//     callbackURL: config.get('ORCID_REDIRECT'),
//     clientID: config.get('ORCID_CLIENT_ID'),
//     clientSecret: config.get('ORCID_CLIENT_SECRET'),
// })
@Injectable()
export class OrcidStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super(
      {
        sandbox: configService.get<string>('ENV_NAME') === 'development',
        callbackURL: configService.get<string>('ORCID_REDIRECT'),
        clientID: configService.get<string>('ORCID_CLIENT_ID'),
        clientSecret: configService.get<string>('ORCID_CLIENT_SECRET'),
      },

      async function (accessToken, refreshToken, params, profile, done) {
        [accessToken, refreshToken, params, profile].forEach((x, i) => {
          console.log(`[${i}] => `,x);
        });
        // Verify access params.id contains the orcid
        const orcid_id: string = params.orcid;
        // const user = await usersService.get_by_orcid(orcid_id);

        // constructing update object for user
        const update_obj = {};
        if (params.scope === '/activities/update') {
          update_obj['orcid_permission'] = params.access_token;
        }

        const token = authService.generate_cookie_token();

        // TODO: check meaning and purpose of orcid_permission variable
        // const orcid_permission =
        //   params.scope === '/activities/update' ? params.access_token : null;
        usersService.upsert_user(orcid_id, { cookie_token: token, displayedName: params.name });

        done(null, token);
      },
    );
  }
}
