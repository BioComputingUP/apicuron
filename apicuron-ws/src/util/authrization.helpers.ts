import { ForbiddenException } from '@nestjs/common';
import { User } from 'src/core/schemas/user.schema';

export function assertUserManagesResource(user: User, resourceId: string) {
	const managesResource = (user.resources ?? []).some(
		(r) => r.resource_id === resourceId,
	);
	if (!managesResource) {
		throw new ForbiddenException(
			`User with ORCID [${user.orcid_id}] does not manage resource "${resourceId}"`,
		);
	}
}
