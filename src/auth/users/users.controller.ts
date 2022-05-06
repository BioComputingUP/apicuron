import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Prisma } from '@prisma/client';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { UsersService } from './users.service';

@Controller('')
export class UsersController {
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
  @Post('/registerUser')
  // @UseGuards(LocalAuthGuard)
  create_or_update_user(@Body('orcid_id') orcid_id: string, @Body('data') userData: Prisma.usersCreateInput) {
    console.log(userData)
    if(this.usersService.update_user(orcid_id, userData)){
      return `User with ${orcid_id} orcid successfully created`
    }else{
      return `Failed to create user ${orcid_id}`
    }

  }
}
