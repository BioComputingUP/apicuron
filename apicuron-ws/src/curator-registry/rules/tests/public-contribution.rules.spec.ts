import { PrivacyType } from 'src/core/enums';

import {
	ContributionEntry,
	CuratorRegistryEntry,
} from 'src/core/schemas/curator-registry/curator-entry.schema';
import { League } from 'src/core/schemas/index';
import { RegistryFilterContext } from '../filters.interface';
import { PublicContributionRule } from '../public-contribution.rules';

describe('PublicContributionRule', () => {
	let rule: PublicContributionRule;

	beforeEach(() => {
		rule = new PublicContributionRule();
	});

	describe('filterGroup', () => {
		it('should return true for public groups', () => {
			const publicGroup: League = {
				visibility: PrivacyType.public,
				resource_id: 'resource-1',
			} as League;

			const result = rule['filterGroup'](publicGroup, []);

			expect(result).toBe(true);
		});

		it('should return true for private groups that user administers', () => {
			const privateGroup: League = {
				visibility: PrivacyType.private,
				resource_id: 'resource-1',
			} as League;
			const userAdministeredResourceIds = ['resource-1', 'resource-2'];

			const result = rule['filterGroup'](
				privateGroup,
				userAdministeredResourceIds,
			);

			expect(result).toBe(true);
		});

		it('should return false for private groups that user does not administer', () => {
			const privateGroup: League = {
				visibility: PrivacyType.private,
				resource_id: 'resource-1',
			} as League;
			const userAdministeredResourceIds = ['resource-2', 'resource-3'];

			const result = rule['filterGroup'](
				privateGroup,
				userAdministeredResourceIds,
			);

			expect(result).toBe(false);
		});

		it('should return false for private groups when user has no administered resources', () => {
			const privateGroup: League = {
				visibility: PrivacyType.private,
				resource_id: 'resource-1',
			} as League;

			const result = rule['filterGroup'](privateGroup, []);

			expect(result).toBe(false);
		});
	});

	describe('shouldApply', () => {
		it('should run true when showAll is true', () => {
			const context: RegistryFilterContext = {
				showAll: true,
				userAdministeredResourceIds: [],
			};

			const result = rule.shouldApply(context);

			expect(result).toBe(true);
		});

		it('should run when user has administered resources', () => {
			const context: RegistryFilterContext = {
				showAll: false,
				userAdministeredResourceIds: ['resource-1'],
			};

			const result = rule.shouldApply(context);

			expect(result).toBe(true);
		});

		it('should not run when showAll is false and user has no administered resources', () => {
			const context: RegistryFilterContext = {
				showAll: false,
				userAdministeredResourceIds: [],
			};

			const result = rule.shouldApply(context);

			expect(result).toBe(false);
		});
	});

	describe('filterContributionGroups', () => {
		it('should filter groups correctly', () => {
			const contribution: ContributionEntry = {
				groups: [
					{
						visibility: PrivacyType.public,
						resource_id: 'resource-1',
					} as League,
					{
						visibility: PrivacyType.private,
						resource_id: 'resource-2',
					} as League,
					{
						visibility: PrivacyType.private,
						resource_id: 'resource-3',
					} as League,
				],
			} as ContributionEntry;

			const context: RegistryFilterContext = {
				showAll: false,
				userAdministeredResourceIds: ['resource-2'],
			};

			const result = rule['filterContributionGroups'](contribution, context);

			expect(result.groups).toHaveLength(2);
			expect(result.groups[0].resource_id).toBe('resource-1');
			expect(result.groups[1].resource_id).toBe('resource-2');
		});
	});

	describe('filterEntryContributions', () => {
		it('should filter contributions and remove empty ones', () => {
			const entry: CuratorRegistryEntry = {
				contributed_to: [
					{
						groups: [
							{
								visibility: PrivacyType.public,
								resource_id: 'resource-1',
							} as League,
						],
					} as ContributionEntry,
					{
						groups: [
							{
								visibility: PrivacyType.private,
								resource_id: 'resource-2',
							} as League,
						],
					} as ContributionEntry,
					{
						groups: [
							{
								visibility: PrivacyType.private,
								resource_id: 'resource-3',
							} as League,
						],
					} as ContributionEntry,
				],
			} as CuratorRegistryEntry;

			const context: RegistryFilterContext = {
				showAll: false,
				userAdministeredResourceIds: ['resource-3'],
			};

			const result = rule.filterEntryContributions(entry, context);

			expect(result.contributed_to).toHaveLength(2);
			expect(result.contributed_to[0].groups[0].resource_id).toBe('resource-1');
			expect(result.contributed_to[1].groups[0].resource_id).toBe('resource-3');
		});
	});

	describe('applyFilter', () => {
		it('should apply filtering to all entries', () => {
			const entries: CuratorRegistryEntry[] = [
				{
					contributed_to: [
						{
							groups: [
								{
									visibility: PrivacyType.public,
									resource_id: 'resource-1',
								} as League,
								{
									visibility: PrivacyType.private,
									resource_id: 'resource-2',
								} as League,
							],
						} as ContributionEntry,
					],
				} as CuratorRegistryEntry,
				{
					contributed_to: [
						{
							groups: [
								{
									visibility: PrivacyType.private,
									resource_id: 'resource-3',
								} as League,
							],
						} as ContributionEntry,
					],
				} as CuratorRegistryEntry,
			];

			const context: RegistryFilterContext = {
				showAll: false,
				userAdministeredResourceIds: ['resource-2'],
			};

			const result = rule.applyFilter(context, entries);

			expect(result).toHaveLength(2);
			expect(result[0].contributed_to).toHaveLength(1);
			expect(result[0].contributed_to[0].groups).toHaveLength(2);
			expect(result[1].contributed_to).toHaveLength(0);
		});
	});
});
