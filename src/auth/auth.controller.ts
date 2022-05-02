import { Controller, Get, Param, Redirect, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/users/users.service';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('')
export class AuthController {
  constructor(private usersService: UsersService) {}

  // redirect to orcid
  @Get('auth/orcid')
  @UseGuards(AuthGuard('orcid'))
  authenticate_orcid() {}

  @Get('/auth/orcid_permission')
  @UseGuards(AuthGuard('orcid'))
  orcid_permission() {}

  @Get('/auth/orcid/redirect')
  @Redirect()
  @UseGuards(AuthGuard('orcid'))
  orcid_redirect(@Param('user') user_cookie_token) {
    this.usersService
      .get_by_cookie_token(user_cookie_token)
      .then((user) => {
        return { url: '/orcid/' + user.orcid_id, statusCode: 301 };
      })
      .catch((e) => {
        return { url: '/not_registered', statusCode: 301 };
        // return "User not found or database error, " + e
      });
  }

  //   @UseGuards(AuthGuard('orcid'))
  @Get('/token')
  @UseGuards(LocalAuthGuard)
  get_token() {
    //   TODO: Update the function to retrieve the actual token
    return 'the token';
  }
}
