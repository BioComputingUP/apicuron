import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { uuid } from 'uuidv4';

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
  ) {}

  generate_cookie_token() {
    return uuid();
  }

  generate_jwt_token(user: userJWT) {
    const jwtToken = this.jwtService.sign(user);
    const prefix = this.configService.get<string>('JWT_PREFIX');
    const header = this.configService.get<string>('JWT_HEADER');
    return { header, token: prefix + ' ' + jwtToken };
  }
}
