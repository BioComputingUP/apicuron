import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UsersService } from '../users/users.service';

@Injectable()
export class HasAResourceGuard implements CanActivate {
	constructor(protected userService: UsersService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();

		if (req.user.orcid_id) {
			const user = await this.userService.getByOrcid(req.user.orcid_id);
			if (
				!!user.resources &&
				Array.isArray(user.resources) &&
				user.resources.length > 0
			) {
				return true;
			} else {
				return false;
			}
		}

		return false;
	}
}
