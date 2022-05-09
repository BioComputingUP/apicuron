import { Injectable } from '@nestjs/common';
import { uuid } from 'uuidv4';

@Injectable()
export class AuthService {
  // constructor() {}

  generate_cookie_token() {
    return uuid();
  }
}
