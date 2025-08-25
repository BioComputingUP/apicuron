import { PrivacyType } from 'src/core/enums';
import {
	ContributionEntry,
	CuratorRegistryEntry,
} from 'src/core/schemas/curator-registry/curator-entry.schema';
import { League } from 'src/core/schemas/index';
import { FilterStrategyRule, RegistryFilterContext } from './filters.interface';
/**
 * Rule to only show public contributions and private contributions the user administers.
 */
export class PublicContributionRule
	implements FilterStrategyRule<CuratorRegistryEntry>
{
	name = 'Public Contribution';

	shouldApply(context: RegistryFilterContext): boolean {
		return !context.showAll;
	}

	applyFilter(
		context: RegistryFilterContext,
		items: CuratorRegistryEntry[],
	): CuratorRegistryEntry[] {
		// Filter out contributions to private groups unless the user administers their resources

		return items.map((entry) => {
			return this.filterEntryContributions(entry, context);
		});
	}

	filterEntryContributions(
		entry: CuratorRegistryEntry,
		context: RegistryFilterContext,
	): CuratorRegistryEntry {
		return {
			...entry,
			contributed_to: entry.contributed_to
				.map((contribution) =>
					this.filterContributionGroups(contribution, context),
				)
				.filter((contribution) => contribution.groups.length > 0),
		};
	}

	private filterContributionGroups(
		contribution: ContributionEntry,
		context: RegistryFilterContext,
	): ContributionEntry {
		const visibleGroups = contribution.groups.filter((group) =>
			this.filterGroup(group, context.userAdministeredResourceIds),
		);
		return {
			...contribution,
			groups: visibleGroups,
		};
	}
	private filterGroup(
		group: League,
		userAdministeredResourceIds: string[],
	): boolean {
		return (
			group.visibility === PrivacyType.public ||
			userAdministeredResourceIds.includes(group.resource_id)
		);
	}
}
