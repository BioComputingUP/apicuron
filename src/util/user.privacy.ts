import { FilterQuery, HydratedDocument } from 'mongoose';
import { User } from '../core/schemas/user.schema';
import { PrivacyType } from '../core/enums';

type ResourceEntity = {
	resource_id: string;
	privacy: PrivacyType;
};
type ResourceEntityDocuemnt = HydratedDocument<ResourceEntity>;

export function getPrivacyQueryFromUser(
	user: User,
): FilterQuery<ResourceEntityDocuemnt> {
	const allowedResources = user.resources.map((r) => r.resource_id);
	return {
		$or: [
			{ resource_id: { $in: allowedResources } },
			{
				privacy: PrivacyType.public,
			},
		],
	};
}
