import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Redirect,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { Logger } from '@nestjs/common';

@Controller('')
export class UsersController {
  constructor(private usersService: UsersService) {}
  private usersControllerLogger = new Logger(UsersController.name);
 
  @Post('/registerUser')
  @UseGuards(LocalAuthGuard)
  create_or_update_user(@Body() userData: UpdateUserDto, @Res() res) {
    console.log(`Received message: ${userData}`);
    this.usersService
      .upsert_user(userData.orcid_id, userData)
      .then((response) => {
        this.usersControllerLogger.log(response);
        res.status(HttpStatus.ACCEPTED).send({
          statusCode: HttpStatus.ACCEPTED,
          message: `Created or upserted used with ${userData.orcid_id}`,
        });
      })
      .catch((err) => {
        this.usersControllerLogger.error(err);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'An Internal Error Occured',
        });
      });
  }
}
