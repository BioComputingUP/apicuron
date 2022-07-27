import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { uuid } from 'uuidv4';
import { UsersService } from './users/users.service';

export interface userJWT {
  orcid_id: string;
  username: string;
  iat: number;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private userService: UsersService
  ) {}

  generate_cookie_token() {
    return uuid();
  }

  async generate_jwt_token(user: userJWT) {
    const { jwt_token } =  await this.userService.get_by_orcid(user.orcid_id)
    const jwtToken = this.jwtService.sign({ ...user, jwt_token });
    const prefix = this.configService.get<string>('JWT_PREFIX');
    const header = this.configService.get<string>('JWT_HEADER');
    return { header, token: prefix + ' ' + jwtToken };
  }
}
