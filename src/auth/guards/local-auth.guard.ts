import {
	CanActivate,
	ExecutionContext,
	Injectable,
	Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { isObservable, lastValueFrom } from 'rxjs';
import { UsersService } from '../users/services/users.service';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

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
		protected reflector: Reflector,
	) {
		super();
	}

	readonly orcidHeader = 'orcid-token';

	private readonly localAuthGuardLogger = new Logger(LocalAuthGuard.name);
	async canActivate(context: ExecutionContext) {
		const req = context.switchToHttp().getRequest();

		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
		const orcidAuth$ = this.checkOrcidAuth(req);
		const jwtAuth$ = this.checkJwtAuth(context);

		const [orcidAuth, jwtAuth] = await Promise.all([orcidAuth$, jwtAuth$]);

		if (isPublic) {
			// if the request is public, we return true
			return true;
		} else {
			// otherwise we return the verification of one of these two verifications
			return jwtAuth || orcidAuth;
		}
	}

	async checkOrcidAuth(req): Promise<boolean> {
		if (req.headers[this.orcidHeader]) {
			const user = await this.usersService.getPrivateUser({
				orcid_permission: req.headers[this.orcidHeader],
			});

			if (!!user) {
				req.user = user;
				return true;
			}
		}
		return false;
	}

	async checkJwtAuth(context: ExecutionContext): Promise<boolean> {
		try {
			const jwtAuth$ = super.canActivate(context);
			// if output is observable, return last emitted value
			if (isObservable(jwtAuth$)) {
				return lastValueFrom(jwtAuth$);
			}
			// otherwise await response
			return await jwtAuth$;
		} catch (e) {
			// if an error occurs (Unauthorized, silently return false but log error to console)
			// this.localAuthGuardLogger.error(e);
			return false;
		}
	}
}
