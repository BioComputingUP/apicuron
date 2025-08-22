import {
	ContributionEntry,
	CuratorRegistryEntry,
} from 'src/core/schemas/curator-registry/curator-entry.schema';
import { RegistryFilterContext } from '../filters.interface';
import { RequestedResourceRule } from '../requested-resource.rule';

describe('RequestedResourceRule', () => {
	let rule: RequestedResourceRule;

	beforeEach(() => {
		rule = new RequestedResourceRule();
	});

	describe('shouldApply', () => {
		it('should return false when showAll is false and no requested resources', () => {
			const context: RegistryFilterContext = {
				showAll: false,
				userAdministeredResourceIds: [],
				requestedResources: [],
			};
			expect(rule.shouldApply(context)).toBe(false);
		});
		it('should return false when requestedResources is undefined and showAll is false', () => {
			const context: RegistryFilterContext = {
				showAll: false,
				userAdministeredResourceIds: [],
			};
			expect(rule.shouldApply(context)).toBe(false);
		});

		it('should return true when requestedResources is non-empty', () => {
			const context: RegistryFilterContext = {
				showAll: false,
				userAdministeredResourceIds: [],
				requestedResources: ['resource-1'],
			};
			expect(rule.shouldApply(context)).toBe(true);
		});

		it('should return true when showAll is true', () => {
			const context: RegistryFilterContext = {
				showAll: true,
				userAdministeredResourceIds: [],
				requestedResources: [],
			};
			expect(rule.shouldApply(context)).toBe(true);
		});
	});

	describe('applyFilter', () => {
		it('should filter entries by requestedResources', () => {
			const entries: CuratorRegistryEntry[] = [
				{
					contributed_to: [
						{ resource_id: 'resource-1' } as ContributionEntry,
						{ resource_id: 'resource-2' } as ContributionEntry,
					],
				} as CuratorRegistryEntry,
				{
					contributed_to: [{ resource_id: 'resource-3' } as ContributionEntry],
				} as CuratorRegistryEntry,
			];
			const context: RegistryFilterContext = {
				showAll: false,
				userAdministeredResourceIds: [],
				requestedResources: ['resource-2'],
			};
			const result = rule.applyFilter(context, entries);
			expect(result).toHaveLength(1);
			expect(
				result[0].contributed_to.some((c) => c.resource_id === 'resource-2'),
			).toBe(true);
		});

		it('should return all entries if requestedResources is undefined', () => {
			const entries: CuratorRegistryEntry[] = [
				{
					contributed_to: [{ resource_id: 'resource-1' } as ContributionEntry],
				} as CuratorRegistryEntry,
			];
			const context: RegistryFilterContext = {
				showAll: false,
				userAdministeredResourceIds: [],
			};
			const result = rule.applyFilter(context, entries);
			expect(result).toHaveLength(1);
		});

		it('should return no entries if none match requestedResources', () => {
			const entries: CuratorRegistryEntry[] = [
				{
					contributed_to: [{ resource_id: 'resource-1' } as ContributionEntry],
				} as CuratorRegistryEntry,
			];
			const context: RegistryFilterContext = {
				showAll: false,
				requestedResources: ['resource-99'],
				userAdministeredResourceIds: [],
			};
			const result = rule.applyFilter(context, entries);
			expect(result).toHaveLength(0);
		});
	});
});
