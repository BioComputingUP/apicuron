import { PrivacyType } from 'src/core/enums';
import { CuratorRegistryEntry } from 'src/core/schemas/curator-registry/curator-entry.schema';
import { FilterStrategyRule, RegistryFilterContext } from './filters.interface';
/**
 * Rule to only show public users.
 */
export class UserPrivacyFilterRule implements FilterStrategyRule {
	name = 'Public Users Only';

	shouldApply(context: RegistryFilterContext): boolean {
		return !context.showAll;
	}

	applyFilter(
		context: RegistryFilterContext,
		items: CuratorRegistryEntry[],
	): CuratorRegistryEntry[] {
		return items.filter((item) => {
			const itemPrivacy =
				item.privacy || item.curator?.privacy || PrivacyType.private;
			return (
				itemPrivacy === PrivacyType.public ||
				item.contributed_to.some((contribution) =>
					context.userAdministeredResourceIds.includes(
						contribution.resource_id,
					),
				)
			);
		});
	}
}
