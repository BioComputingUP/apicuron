import { CuratorRegistryEntry } from 'src/core/schemas/curator-registry/curator-entry.schema';
import { FilterStrategyContext, FilterStrategyRule } from './filters.interface';
/**
 * Rule to filter out entries that don't include any requested resource
 */
export class RequestedResourceRule
	implements FilterStrategyRule<CuratorRegistryEntry>
{
	name = 'Public Requested Resource';

	shouldApply(context: FilterStrategyContext): boolean {
		return (
			!context.showAll &&
			!!context.requestedResources &&
			context.requestedResources.length > 0
		);
	}

	applyFilter(
		context: FilterStrategyContext,
		items: CuratorRegistryEntry[],
	): CuratorRegistryEntry[] {
		console.debug('applyFilter', this.name);
		const requestedResource = context.requestedResources;
		if (requestedResource) {
			return items.filter((entry) =>
				entry.contributed_to.some((contribution) =>
					requestedResource.includes(contribution.resource_id),
				),
			);
		}
		return items;
	}
}
