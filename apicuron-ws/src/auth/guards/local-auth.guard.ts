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
import { Observable, isObservable, lastValueFrom } from 'rxjs';
import { UsersService } from '../users/users.service';
import { AuthGuard } from '@nestjs/passport';

export interface JwtPayload {
	orcid_id: string;
	iss: number;
	username: string;
}
@Injectable()
export class LocalAuthGuard extends AuthGuard('jwt') implements CanActivate {
	constructor(
		protected usersService: UsersService,
		protected jwtService: JwtService,
		protected configService: ConfigService,
	) {
		super();
	}

	readonly orcidHeader = 'orcid-token';

	private readonly localAuthGuardLogger = new Logger(LocalAuthGuard.name);
	async canActivate(context: ExecutionContext) {
		const req = context.switchToHttp().getRequest();
		if (req.headers[this.orcidHeader]) {
			const user = await this.usersService.getPrivateUser({
				orcid_permission: req.headers[this.orcidHeader],
			});
			if (!!user) {
				req.user = user;
				return true;
			}
		}
		const output = super.canActivate(context);

		if (isObservable(output)) {
			return lastValueFrom(output);
		} else {
			return await output;
		}
	}
}
