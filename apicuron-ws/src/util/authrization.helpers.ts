import { ForbiddenException } from '@nestjs/common';
import { uniq } from 'lodash';

/**
 * Throws a 403 naming the resources the user manages
 * when the user does not manage one of the given resources.
 */
export function assertUserManagesResource(
	user: { orcid_id?: string; resources?: { resource_id: string }[] },
	resourceIds: string | string[],
) {
	const managed = (user.resources ?? []).map((r) => r.resource_id);
	const forbidden = uniq([resourceIds].flat()).filter(
		(resourceId) => !managed.includes(resourceId),
	);
	if (forbidden.length === 0) {
		return;
	}
	const forbiddenText = forbidden.map((id) => `"${id}"`).join(', ');
	const managedText =
		managed.length > 0
			? `It manages [${managed.join(', ')}].`
			: 'It manages no resource.';
	throw new ForbiddenException(
		`Your account (${user.orcid_id}) does not manage ${forbiddenText}. ${managedText}`,
	);
}
