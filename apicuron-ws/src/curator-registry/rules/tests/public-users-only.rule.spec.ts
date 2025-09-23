// filepath: /home/mehdi/projects/apicuron/apicuron-ws/src/curator-registry/rules/public-users-only.rule.test.ts

import { PrivacyType } from 'src/core/enums';
import {
	ContributionEntry,
	CuratorRegistryEntry,
} from 'src/core/schemas/curator-registry/curator-entry.schema';
import { RegistryFilterContext } from '../filters.interface';
import { UserPrivacyFilterRule } from '../user-privacy.rule';

describe('PublicUsersOnlyRule', () => {
	let rule: UserPrivacyFilterRule;

	beforeEach(() => {
		rule = new UserPrivacyFilterRule();
	});

	describe('shouldApply', () => {
		it('should run when user has administered resources', () => {
			const context: RegistryFilterContext = {
				showAll: false,
				userAdministeredResourceIds: ['resource-1'],
			};

			const result = rule.shouldApply(context);

			expect(result).toBe(true);
		});

		it('should return true when showAll is false', () => {
			const context: RegistryFilterContext = {
				showAll: false,
				userAdministeredResourceIds: [],
			};

			const result = rule.shouldApply(context);

			expect(result).toBe(true);
		});

		it('should return false when showAll is true', () => {
			const context: RegistryFilterContext = {
				showAll: true,
				userAdministeredResourceIds: [],
			};

			const result = rule.shouldApply(context);

			expect(result).toBe(false);
		});
	});
	describe('applyFilter', () => {
		it('should include only public users', () => {
			const entries: CuratorRegistryEntry[] = [
				{
					privacy: PrivacyType.public,
					contributed_to: [],
				} as unknown as CuratorRegistryEntry,
				{
					privacy: PrivacyType.private,
					contributed_to: [],
				} as unknown as CuratorRegistryEntry,
			];
			const context: RegistryFilterContext = {
				showAll: false,
				userAdministeredResourceIds: [],
			};
			const result = rule.applyFilter(context, entries);
			expect(result).toHaveLength(1);
			expect(result[0].privacy).toBe(PrivacyType.public);
		});

		it('should include users who contributed to user administered resources', () => {
			const entries: CuratorRegistryEntry[] = [
				{
					privacy: PrivacyType.private,
					contributed_to: [{ resource_id: 'resource-1' } as ContributionEntry],
				} as CuratorRegistryEntry,
				{
					privacy: PrivacyType.private,
					contributed_to: [{ resource_id: 'resource-2' } as ContributionEntry],
				} as CuratorRegistryEntry,
			];
			const context: RegistryFilterContext = {
				showAll: false,
				userAdministeredResourceIds: ['resource-1'],
			};
			const result = rule.applyFilter(context, entries);
			expect(result).toHaveLength(1);
			expect(result[0].contributed_to[0].resource_id).toBe('resource-1');
		});
	});
});
