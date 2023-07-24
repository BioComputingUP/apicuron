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

		return !!req.user;
	}

}
