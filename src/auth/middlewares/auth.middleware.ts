import {
	Injectable,
	Logger,
	NestMiddleware,
	UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

export interface JwtPayload {
	orcid_id: string;
	iss: number;
	username: string;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
	constructor(
		protected usersService: UsersService,
		protected jwtService: JwtService,
		protected configService: ConfigService,
	) {}
	private readonly authMiddlewareLogger = new Logger(AuthMiddleware.name);

	async use(req, res: Response, next: NextFunction) {
		try {
			const header = this.check_auth_header(req);
			if(!header){
				req.user = null
				next();
				return
			}
			const token = this.get_token(header);
			const payload = this.check_token(token);
			req.user = await this.usersService.get_by_orcid(payload.orcid_id);
		} catch (e) {
			this.authMiddlewareLogger.error(e.message);
			req.user = null;
		}
		next();
	}

	check_token(token: string): JwtPayload {
		try {
			return this.jwtService.verify(token);
		} catch (e) {
			this.authMiddlewareLogger.error(e);
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
			this.authMiddlewareLogger.error('Wrong header formatting Error ', e);
			this.unauthorized_exception(
				'Wrong hader formatting, correct format is: Bearer <your-token>',
			);
		}
	}

	check_auth_header(req: Request): string {
		const tokenKey = this.configService.get<string>('JWT_HEADER');
		if (req.header(tokenKey)) {
			this.authMiddlewareLogger.log('user has header');
			return req.header(tokenKey);
		} else if (req.cookies[tokenKey]) {
			return req.cookies[tokenKey];
		} else {
			this.authMiddlewareLogger.log('Absent Authorization header');
			return null
			// this.unauthorized_exception('authorization header non-existent');
		}
	}

	unauthorized_exception(reason: string) {
		throw new UnauthorizedException({
			statusCode: 403,
			message: 'Forbidden resource: ' + reason,
			reason,
			error: 'Forbidden',
		});
	}
}
