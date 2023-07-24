import {
  Body,
  Controller,
  Get,
  Header,
  Headers,
  HttpStatus,
  Param,
  Post,
  Redirect,
  Req,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { Roles } from '../decorators/roles.decorator';
import { User } from '../decorators/applyUser.decorator';
import { createReadStream } from 'fs';
import { json_to_tsv } from './json-tsv';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { AuthorizationHeader, VersionHeader } from '../../swagger/config';

@ApiTags('First Version')
@Controller('')
export class UsersController {
  constructor(private usersService: UsersService) {}
  private usersControllerLogger = new Logger(UsersController.name);
 
  @Post('/registerUser')
  @Roles('admin')
  @UseGuards(LocalAuthGuard, RoleGuard)
  create_or_update_user(@Body() userData: UpdateUserDto, @Res() res) {
    // console.log(`Received message: ${userData}`);
    this.usersService
      .upsert_user(userData.orcid_id, userData)
      .then((response) => {
        this.usersControllerLogger.log(response);
        res.status(HttpStatus.ACCEPTED).send({
          statusCode: HttpStatus.ACCEPTED,
          message: `Created or upserted user orcid ${userData.orcid_id}`,
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


  @Get('/browse')
  // @Roles('user')
  @UseGuards(LocalAuthGuard)
  async get_user_stats(@Param() params, @Res() res: Response, @Req() req){
    // params['orcid_filter'] = 

    const result = await this.usersService.get_users_with_stats(params)
    
    res.header('count',result[0]['biocurators_count']);
    res.send(result[0]['biocurators'])
  }

  @Get('/achievements')
  async get_user_achievements(@Param() params, @Req() req, @Headers('format') format, @Res() res) {
    const result = await this.usersService.get_achievements({ ...params, user: !!req.user ? req.user.orcid_id : null})
    if(!!format && format == 'tsv'){

      res.set({
        'Content-Type': 'text/tab-separated-values',
        'Content-Disposition': 'attachment; filename="apicuron_achievements.tsv"',
      });
      res.send(json_to_tsv(result))
    } else if(!format || !!format && format == 'json'){
      res.set({
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="apicuron_achievements.json"',
      });
      
      res.send(result)
    }
    
  }
}

@ApiTags('Users')
@ApiHeader(VersionHeader)
@Controller({
	version: '2',
	path: 'users'
})
export class UserControllerV2 {
  constructor(private usersService: UsersService){}

  @Get(':orcid_id')
  async get_curator(@Param('orcid_id') orcid_id: string){
    return await this.usersService.get_by_orcid(orcid_id)
  }
}
