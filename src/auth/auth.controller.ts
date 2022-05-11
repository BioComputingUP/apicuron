import {
  Controller,
  Get,
  Logger,
  Req,
  Redirect,
  UseGuards,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('')
export class AuthController {
  constructor(private authService: AuthService) {}

  private authControllerLogger = new Logger(AuthController.name);

  // redirect to orcid
  @Get('auth/orcid')
  @UseGuards(AuthGuard('orcid'))
  authenticate_orcid() {}

  @Get('/auth/orcid_permission')
  @UseGuards(AuthGuard('orcid'))
  orcid_permission() {}

  @Get('/auth/orcid/redirect')
  @Redirect('/orcid/', 301)
  @UseGuards(AuthGuard('orcid'))
  orcid_redirect(@Req() { user }, @Res() res) {
    const { header, token} = this.authService.generate_jwt_token(user)
    res.cookie(header, token)
    res.set(header, token)
    return { url: '/orcid/' + user.orcid_id, statusCode: 301 }
  }

  @Get('/orcid/:orcid_id')
  @UseGuards(LocalAuthGuard)
  protected_page(){
    return 'Can be accessed'
  }
}
