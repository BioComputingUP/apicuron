import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from '../users/users.service';

@Injectable()
export class OrcidMiddleware implements NestMiddleware {
	readonly orcidHeader = 'orcid-token';
	constructor(protected userService: UsersService) {}

	async use(req: any, res: any, next: (error?: any) => void) {
		if (req.headers[this.orcidHeader]) {
			const user = await this.userService.getPrivateUser({
				orcid_permission: req.headers[this.orcidHeader],
			});

			if (!!user) {
				req.user = user;
			}
		}

		next();
	}
}
