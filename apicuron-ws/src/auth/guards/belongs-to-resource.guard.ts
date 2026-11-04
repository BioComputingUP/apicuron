import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { UsersService } from '../users/services/users.service';

@Injectable()
export class HasAResourceGuard implements CanActivate {
	constructor(protected userService: UsersService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();

		if (req.user?.orcid_id) {
			const user = await this.userService.getByOrcid(req.user.orcid_id);
			// admins manage every resource, even when they are not listed as a manager
			if (user?.role === 'admin') {
				return true;
			}
			if (
				!!user &&
				!!user.resources &&
				Array.isArray(user.resources) &&
				user.resources.length > 0
			) {
				return true;
			} else {
				throw new ForbiddenException(
					`Your account (${req.user.orcid_id}) manages no resource. Ask a manager of your resource to add you, or create one at /resources/create.`,
				);
			}
		}

		return false;
	}
}
