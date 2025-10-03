import { Logger } from '@nestjs/common';
import * as _ from 'lodash';
import { PrivacyType } from 'src/core/enums';
import {
	ContributionEntry,
	CuratorRegistryEntry,
} from 'src/core/schemas/curator-registry/curator-entry.schema';
import { League } from 'src/core/schemas/index';
import { createUnknownCuratorEntry } from '../helpers/registry.helpers';
import { FilterStrategyRule, RegistryFilterContext } from './filters.interface';
/**
 * Rule to only show public contributions and private contributions the user administers.
 */
export class ContributionPrivacyFilterRule implements FilterStrategyRule {
	name = 'Public Contribution';
	logger = new Logger(ContributionPrivacyFilterRule.name);
	shouldApply(context: RegistryFilterContext): boolean {
		return !context.showAll;
	}

	applyFilter(
		context: RegistryFilterContext,
		contributions: CuratorRegistryEntry[],
	): CuratorRegistryEntry[] {
		// Filter out contributions to private groups unless the user administers their resources
		const res = contributions.map((entry) => {
			const filteredContributions = entry.contributed_to
				.map((contribution) =>
					this.filterContributionGroups(contribution, context),
				)
				.filter(
					(contribution): contribution is ContributionEntry =>
						contribution.groups.length > 0,
				);
			this.logger.log(
				`${filteredContributions.length} contributions after filtering`,
			);

			return this.restrictToRequestedResources(
				{
					...entry,
					contributed_to: filteredContributions || [],
				},
				context,
			);
		});
		return res;
	}

	/**
	 * Restricts the entry to the requested resources if any are specified.
	 * If no contributions match any requested entry, anonymize the entry.
	 * @param entry : The user entry being processed
	 * @param context: The filtering context
	 * @returns the entry or an anonymous entry
	 */
	private restrictToRequestedResources(
		entry: CuratorRegistryEntry,
		context: RegistryFilterContext,
	): CuratorRegistryEntry {
		if (
			!context.requestedResources ||
			context.requestedResources.length === 0
		) {
			return entry;
		}
		const contributed_resources = entry.contributed_to.map(
			(contribution) => contribution.resource_id,
		);
		const intersection = _.intersection(
			contributed_resources,
			context.requestedResources,
		);
		this.logger.debug(`intersection: ${intersection.length}`);
		return intersection.length > 0 ? entry : createUnknownCuratorEntry();
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
