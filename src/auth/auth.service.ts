import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { uuid } from 'uuidv4';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
  ) {}

  generate_cookie_token() {
    return uuid();
  }
}
