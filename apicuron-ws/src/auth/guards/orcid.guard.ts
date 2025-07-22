import {
	Injectable,
	CanActivate,
	ExecutionContext,
	Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class OrcidGuard extends AuthGuard('orcid') implements CanActivate {
	constructor(protected config: ConfigService) {
		super();
	}
	logger = new Logger(OrcidGuard.name);

	canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		return super.canActivate(context);
	}
}
