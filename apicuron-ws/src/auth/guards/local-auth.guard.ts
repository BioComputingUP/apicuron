import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
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

		if (isPublic || jwtAuth || orcidAuth) {
			return true;
		}
		throw new ForbiddenException(this.getFailureReason(req));
	}

	/**
	 * Tells the caller why the request could not be authenticated.
	 */
	private getFailureReason(req): string {
		const header = req.headers['authorization'] as string | undefined;
		if (!header && !req.headers[this.orcidHeader]) {
			return 'This endpoint needs an API token. Send: Authorization: Bearer <token>';
		}
		if (header && !/^bearer\s+\S/i.test(header)) {
			return 'Your token has no "Bearer " prefix. Send: Authorization: Bearer <token>';
		}
		return 'This API token is not valid on this site. Tokens from dev.apicuron.org and apicuron.org are not interchangeable.';
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
