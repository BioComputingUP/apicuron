import { Injectable, Logger } from '@nestjs/common';
import { CuratorRegistryEntry } from 'src/core/schemas/curator-registry/curator-entry.schema';
import { ContributionPrivacyFilterRule } from '../rules/contribution-privacy.rule';
import { RegistryFilterContext } from '../rules/filters.interface';
import { RequestedResourceFilterRule } from '../rules/requested-resource.rule';
import { UserPrivacyFilterRule } from '../rules/user-privacy.rule';
@Injectable()
export class RegistryFilterStrategy {
	filerPipeline = [
		new UserPrivacyFilterRule(),
		new ContributionPrivacyFilterRule(),
		new RequestedResourceFilterRule(),
	]; // !! order matters

	logger = new Logger(RegistryFilterStrategy.name);

	filter(
		context: RegistryFilterContext,
		unfilteredEntries: CuratorRegistryEntry[],
	): CuratorRegistryEntry[] {
		// Filter entries first to avoid processing unnecessary contributions
		let filteredEntries: CuratorRegistryEntry[] = unfilteredEntries;
		for (const rule of this.filerPipeline) {
			if (rule.shouldApply(context)) {
				filteredEntries = rule.applyFilter(context, filteredEntries);
			}
		}

		return filteredEntries;
	}
}
