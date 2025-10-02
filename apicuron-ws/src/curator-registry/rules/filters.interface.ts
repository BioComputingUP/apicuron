import {
	ContributionEntry,
	CuratorRegistryEntry,
} from 'src/core/schemas/curator-registry/curator-entry.schema';

export interface RegistryFilterContext {
	// Resources that were queried
	requestedResources?: string[];
	// Resources that the requesting user administers
	userAdministeredResourceIds: string[];
	// Override visibility - Use for debugging
	showAll: boolean;
}

export interface FilterStrategyRule<
	T extends CuratorRegistryEntry = CuratorRegistryEntry,
> {
	name: string;
	/**
	 * Determines if the filter should be applied based on the context.
	 * @param context The context in which the filter is being applied.
	 */
	shouldApply(context: RegistryFilterContext): boolean;

	/**
	 * Applies the filter to the given items based on the context.
	 * @param context The context in which the filter is being applied.
	 * @param items The items to filter.
	 */
	applyFilter(context: RegistryFilterContext, items: T[]): T[];
}

export interface ContributionFilterRule<
	T extends ContributionEntry = ContributionEntry,
> {
	name: string;
	/**
	 * Determines if the filter should be applied based on the context.
	 * @param context The context in which the filter is being applied.
	 */
	shouldApply(context: RegistryFilterContext): boolean;

	/**
	 * Applies the filter to the given contributions based on the context.
	 * @param context The context in which the filter is being applied.
	 * @param contributions The contributions to filter.
	 */
	applyFilter(context: RegistryFilterContext, contributions: T[]): T[];
}
