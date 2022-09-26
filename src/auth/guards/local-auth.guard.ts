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
import { UsersService } from '../users/users.service';

export interface JwtPayload {
	orcid_id: string;
	iss: number;
	username: string;
}
@Injectable()
export class LocalAuthGuard implements CanActivate {
	constructor(
		protected usersService: UsersService,
		protected jwtService: JwtService,
		protected configService: ConfigService,
	) {}
	private readonly localAuthGuardLogger = new Logger(LocalAuthGuard.name);
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		// const header = this.check_auth_header(req);
		// const token = this.get_token(header);
		// const payload = this.check_token(token);
		// req.user = await this.usersService.get_by_orcid(payload.orcid_id);

		return !!req.user;
	}

	check_token(token: string): JwtPayload {
		try {
			return this.jwtService.verify(token);
		} catch (e) {
			this.localAuthGuardLogger.error(e);
			this.unauthorized_exception('Invalid or expired Token');
		}
	}

	get_token(header: string): string {
		try {
			const token_prefix = this.configService.get<string>('JWT_PREFIX');
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
