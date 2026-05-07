import {
	ContributionEntry,
	CuratorRegistryEntry,
} from 'src/core/schemas/curator-registry/curator-entry.schema';
import { League, PartnerResource, User } from 'src/core/schemas/index';
export function createContributionQuery(
	resource: PartnerResource | undefined,
	league: League | undefined,
): ContributionEntry[] | [] {
	if (!resource || !league) {
		return [];
	}
	return [
		{
			resource_id: resource.resource_id,
			resource: resource,
			groups: [league],
		},
	];
}

export function createUnknownCuratorEntry(): CuratorRegistryEntry {
	return {
		curator_orcid: '',
		curator: {
			displayedName: 'Private User',
		} as User,
		privacy: 'private',
		contributed_to: [],
	};
}
