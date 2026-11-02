import { Injectable, Logger } from '@nestjs/common';
import { CuratorRegistryEntry } from 'src/core/schemas/curator-registry/curator-entry.schema';
import { ContributionPrivacyFilterRule } from '../rules/contribution-privacy.rule';
import { RegistryFilterContext } from '../rules/filters.interface';
@Injectable()
export class RegistryFilterStrategy {
	filterPipeline = [new ContributionPrivacyFilterRule()]; // !! order matters

	logger = new Logger(RegistryFilterStrategy.name);

	filter(
		context: RegistryFilterContext,
		unfilteredEntries: CuratorRegistryEntry[],
	): CuratorRegistryEntry[] {
		let filteredEntries: CuratorRegistryEntry[] = unfilteredEntries;
		for (const rule of this.filterPipeline) {
			if (rule.shouldApply(context)) {
				filteredEntries = rule.applyFilter(context, unfilteredEntries);
			}
		}

		return filteredEntries;
	}
}
