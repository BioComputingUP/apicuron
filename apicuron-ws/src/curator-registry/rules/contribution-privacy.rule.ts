import { PrivacyType } from 'src/core/enums';
import { ContributionEntry } from 'src/core/schemas/curator-registry/curator-entry.schema';
import { League } from 'src/core/schemas/index';
import {
	ContributionFilterRule,
	RegistryFilterContext,
} from './filters.interface';
/**
 * Rule to only show public contributions and private contributions the user administers.
 */
export class ContributionPrivacyFilterRule implements ContributionFilterRule {
	name = 'Public Contribution';

	shouldApply(context: RegistryFilterContext): boolean {
		return !context.showAll;
	}

	applyFilter(
		context: RegistryFilterContext,
		contributions: ContributionEntry[],
	): ContributionEntry[] {
		// Filter out contributions to private groups unless the user administers their resources

		const contributionsWithFilteredGroups = contributions.map(
			(contribution) => {
				return this.filterContributionGroups(contribution, context);
			},
		);
		return this.filterContributionsWithNoGroups(
			contributionsWithFilteredGroups,
		);
	}

	private filterContributionsWithNoGroups(
		contributions: ContributionEntry[],
	): ContributionEntry[] {
		return contributions.filter((contribution) => {
			return contribution.groups.length > 0;
		});
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
