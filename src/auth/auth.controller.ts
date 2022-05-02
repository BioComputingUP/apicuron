import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from 'src/auth/users/users.service';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('')
export class AuthController {
  constructor(private usersService: UsersService) {}



  //   @UseGuards(AuthGuard('orcid'))
  @Get('/token')
  @UseGuards(LocalAuthGuard)
  get_token() {
    //   TODO: Update the function to retrieve the actual token
    return 'the token';
  }
}
