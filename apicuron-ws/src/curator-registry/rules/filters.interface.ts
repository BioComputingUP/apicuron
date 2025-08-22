import {
	ContributionEntry,
	CuratorRegistryEntry,
} from 'src/core/schemas/curator-registry/curator-entry.schema';

export interface FilterStrategyContext {
	requestedResources?: string[];
	userAdministeredResourceIds: string[];
	showAll: boolean;
}

export interface FilterStrategyRule<
	T extends CuratorRegistryEntry | ContributionEntry = CuratorRegistryEntry,
> {
	name: string;
	shouldApply(context: FilterStrategyContext): boolean;
	applyFilter(context: FilterStrategyContext, items: T[]): T[];
}
