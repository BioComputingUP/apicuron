import {
  Controller,
  Get,
  Logger,
  Param,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/auth/users/users.service';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('')
export class AuthController {
  constructor(private usersService: UsersService) {}

  private authControllerLogger = new Logger(AuthController.name);

  @Get('/token')
  @UseGuards(LocalAuthGuard)
  get_token() {
    //   TODO: Update the function to retrieve the actual token
    return 'the token';
  }

  // redirect to orcid
  @Get('auth/orcid')
  @UseGuards(AuthGuard('orcid'))
  authenticate_orcid() {
    console.log('authenticate orcid controller');
  }

  @Get('/auth/orcid_permission')
  @UseGuards(AuthGuard('orcid'))
  orcid_permission() {}

  @Get('/auth/orcid/redirect')
  @Redirect('/orcid/', 301)
  @UseGuards(AuthGuard('orcid'))
  async orcid_redirect(@Param('user') user_cookie_token) {
    try {
      // method returns user based on cookie_token passed
      const { orcid_id } = await this.usersService.get_by_cookie_token(
        user_cookie_token,
      );
      this.authControllerLogger.log(
        `user with orcid ${orcid_id} successfully authenticated and redirected`,
      );
      return { url: '/orcid/' + orcid_id, statusCode: 301 };
    } catch (e) {

      this.authControllerLogger.error('Failed to Authenticate user ', e);
      return { url: '/not_registered', statusCode: 301 };
    }
  }
}
