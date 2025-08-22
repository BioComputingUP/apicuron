import { Injectable, Logger } from '@nestjs/common';
import { CuratorRegistryEntry } from 'src/core/schemas/curator-registry/curator-entry.schema';
import { FilterStrategyContext } from '../rules/filters.interface';
import { PublicContributionRule } from '../rules/public-contribution.rules';
import { PublicUsersOnlyRule } from '../rules/public-users-only.rule';
import { RequestedResourceRule } from '../rules/requested-resource.rule';
@Injectable()
export class PrivacyFilterStrategy {
	entriesRules = [
		new PublicUsersOnlyRule(),
		new PublicContributionRule(),
		new RequestedResourceRule(),
	]; // !! order matters

	logger = new Logger(PrivacyFilterStrategy.name);

	filter(
		context: FilterStrategyContext,
		unfilteredEntries: CuratorRegistryEntry[],
	): CuratorRegistryEntry[] {
		// Filter entries first to avoid processing unnecessary contributions
		let filteredEntries: CuratorRegistryEntry[] = unfilteredEntries;
		for (const rule of this.entriesRules) {
			if (rule.shouldApply(context)) {
				this.logger.debug(`Applying rule: ${rule.constructor.name}`);
				filteredEntries = rule.applyFilter(context, filteredEntries);
			}
		}

		return filteredEntries;
	}
}
