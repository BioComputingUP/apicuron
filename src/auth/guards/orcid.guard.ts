import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { Observable } from 'rxjs';

@Injectable()
export class OrcidGuard extends AuthGuard('orcid') implements CanActivate {

    constructor(protected config: ConfigService) {
        super();
    }
    logger = new Logger(OrcidGuard.name);


    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const req: Request = context.switchToHttp().getRequest();


        if (req.query['redirect_code'] && typeof req.query['redirect_code'] == 'string') {
            try {
                const url = new URL(req.query['redirect_code'], this.config.get<string>('FRONTEND_HOST'));
                req.session['redirect_code'] = url.href;
            } catch (e: any) {
                this.logger.error(e.message, e.stack, e.context);
            }
        }

        return super.canActivate(context);

    }


}