import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { UsersService } from 'src/auth/users/users.service';

@Injectable()
export class LocalAuthGuard implements CanActivate {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}
  private readonly localAuthGuardLogger = new Logger(LocalAuthGuard.name);
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const header = this.check_auth_header(req);
    const token = this.check_header_formatting(header);
    const user = this.check_token(token);

    req.user = user;

    return true;
  }

  check_token(token: string) {
    this.jwtService
      .verifyAsync(token)
      .then((payload) => {
        this.localAuthGuardLogger.log('Token payload: ', payload);
        // this.usersService.get_by_cookie_token(payload.token).then((user) => {
        //   return user;
        // });
      })
      .catch((e) => {
        this.localAuthGuardLogger.error(e);
        this.unauthorized_exception('Invalid or expired Token');
      });
  }

  check_header_formatting(header: string): string {
    try {
      const token_prefix = this.configService.get<string>('JWT_PREFIX')
      const [prefix, token] = header.split(' ');
      if (prefix.toLowerCase() != token_prefix) {
        throw new UnauthorizedException();
      }
      if (!!token && token != '' && token != undefined) {
        return token;
      }
    } catch (e) {
      this.localAuthGuardLogger.error('Wrong header formatting Error ', e);
      this.unauthorized_exception(
        'Wrong hader formatting, correct format is: Bearer <your-token>',
      );
    }
  }

  check_auth_header(req: Request): string {
    const tokenKey = this.configService.get<string>('JWT_HEADER');
    console.log('cookies ', req.cookies[tokenKey]);
    if (req.header(tokenKey)) {
      this.localAuthGuardLogger.log('user has header');
      return req.header(tokenKey);
    } else if (req.cookies[tokenKey]) {
      return req.cookies[tokenKey];
    } else {
      this.localAuthGuardLogger.error('Absent Authorization header');
      this.unauthorized_exception('authorization header non-existent');
    }
  }

  unauthorized_exception(reason: string) {
    throw new UnauthorizedException({
      statusCode: 403,
      message: 'Forbidden resource',
      reason,
      error: 'Forbidden',
    });
  }
}
