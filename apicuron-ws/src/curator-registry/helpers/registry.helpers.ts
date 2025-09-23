import { ContributionEntry } from 'src/core/schemas/curator-registry/curator-entry.schema';
import { League, PartnerResource } from 'src/core/schemas/index';
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
