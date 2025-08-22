import { PrivacyType } from 'src/core/enums';
import { CuratorRegistryEntry } from 'src/core/schemas/curator-registry/curator-entry.schema';
import { FilterStrategyContext, FilterStrategyRule } from './filters.interface';
/**
 * Rule to only show public users.
 */
export class PublicUsersOnlyRule implements FilterStrategyRule {
	name = 'Public Users Only';

	shouldApply(context: FilterStrategyContext): boolean {
		return !context.showAll;
	}

	applyFilter(
		context: FilterStrategyContext,
		items: CuratorRegistryEntry[],
	): CuratorRegistryEntry[] {
		return items.filter(
			(item) =>
				item.privacy === PrivacyType.public ||
				item.contributed_to.some((contribution) =>
					context.userAdministeredResourceIds.includes(
						contribution.resource_id,
					),
				),
		);
	}
}
