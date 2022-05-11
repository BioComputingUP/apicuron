import {
  Controller,
  Get,
  Logger,
  Req,
  Redirect,
  UseGuards,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/auth/users/users.service';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('')
export class AuthController {
  constructor(private usersService: UsersService, private jwtService: JwtService, private configService:ConfigService) {}

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
  authenticate_orcid() {}

  @Get('/auth/orcid_permission')
  @UseGuards(AuthGuard('orcid'))
  orcid_permission() {}

  @Get('/auth/orcid/redirect')
  @Redirect('/orcid/', 301)
  @UseGuards(AuthGuard('orcid'))
  orcid_redirect(@Req() { user }, @Res() res) {
    const jwtToken = this.jwtService.sign(user)
    const header = this.configService.get<string>('JWT_HEADER')
    const prefix = this.configService.get<string>('JWT_PREFIX')
    res.cookie(header, prefix + ' ' + jwtToken)
    res.set(header, prefix + ' ' +jwtToken)
    return { url: '/orcid/' + user.orcid_id, statusCode: 301 }
  }

  @Get('/orcid/:orcid_id')
  @UseGuards(LocalAuthGuard)
  protected_page(){
    return 'Can be accessed'
  }
}
