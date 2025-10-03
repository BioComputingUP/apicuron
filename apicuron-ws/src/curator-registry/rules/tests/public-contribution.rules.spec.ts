import { Logger } from '@nestjs/common';
import { PrivacyType } from 'src/core/enums';

import {
	ContributionEntry,
	CuratorRegistryEntry,
} from 'src/core/schemas/curator-registry/curator-entry.schema';
import { League } from 'src/core/schemas/index';
import { ContributionPrivacyFilterRule } from '../contribution-privacy.rule';
import { RegistryFilterContext } from '../filters.interface';

describe('PublicContributionRule', () => {
	let rule: ContributionPrivacyFilterRule;
	let logger: Logger;
	beforeEach(() => {
		rule = new ContributionPrivacyFilterRule();
		logger = new Logger(ContributionPrivacyFilterRule.name);
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
		it('should return false when showAll is true', () => {
			const context: RegistryFilterContext = {
				showAll: true,
				userAdministeredResourceIds: [],
			};

			const result = rule.shouldApply(context);

			expect(result).toBe(false);
		});

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

	describe('applyFilter', () => {
		const publicGroupRes1: League = {
			visibility: PrivacyType.public,
			resource_id: 'resource-1',
		} as League;
		const privateGroupRes1: League = {
			visibility: PrivacyType.private,
			resource_id: 'resource-1',
		} as League;

		const publicGroupRes2: League = {
			visibility: PrivacyType.public,
			resource_id: 'resource-2',
		} as League;
		const privateGroupRes2: League = {
			visibility: PrivacyType.private,
			resource_id: 'resource-2',
		} as League;
		const contributorEntry = {
			curator_orcid: '0000-0001',
			privacy: PrivacyType.public,
			curator: null,
		} as CuratorRegistryEntry;

		function buildEntryWithContributions(
			contributions: ContributionEntry[],
		): CuratorRegistryEntry[] {
			console.log(contributorEntry);
			return [
				{
					...contributorEntry,
					contributed_to: contributions,
				},
			];
		}
		it('should hide private contributions when user is not resource admin', () => {
			const context: RegistryFilterContext = {
				showAll: false,
				userAdministeredResourceIds: ['resource-2'],
			};

			const contributions: ContributionEntry[] = [
				{
					resource_id: 'resource-1',
					groups: [publicGroupRes1, privateGroupRes1],
				} as ContributionEntry,
			];

			const result = rule.applyFilter(
				context,
				buildEntryWithContributions(contributions),
			);
			expect(result).toHaveLength(1);
			expect(result[0].contributed_to).toHaveLength(1);
			expect(result[0].contributed_to[0].groups).toHaveLength(1);
			expect(result[0].contributed_to[0].groups[0].visibility).toBe(
				PrivacyType.public,
			);
		});

		it('should show private contributions when user is resource admin and hide other resources', () => {
			const context: RegistryFilterContext = {
				showAll: false,
				userAdministeredResourceIds: ['resource-1'],
			};
			const contributions: ContributionEntry[] = [
				{
					resource_id: 'resource-1',
					groups: [publicGroupRes1, privateGroupRes1],
				} as ContributionEntry,
				{
					resource_id: 'resource-2',
					groups: [publicGroupRes2, privateGroupRes2],
				} as ContributionEntry,
			];
			const result = rule['applyFilter'](
				context,
				buildEntryWithContributions(contributions),
			);
			expect(result).toHaveLength(1);
			expect(result[0].contributed_to).toHaveLength(2);
			expect(result[0].contributed_to[0].groups).toHaveLength(2);
			expect(result[0].contributed_to[1].groups).toHaveLength(1);
		});

		it('should not show the resource if all groups are private to the user', () => {
			const context: RegistryFilterContext = {
				showAll: false,
				userAdministeredResourceIds: [],
			};
			const contributions: ContributionEntry[] = [
				{
					resource_id: 'resource-1',
					groups: [privateGroupRes1],
				} as ContributionEntry,
			];
			const result = rule['applyFilter'](
				context,
				buildEntryWithContributions(contributions),
			);
			expect(result).toHaveLength(1);
			expect(result[0].contributed_to).toHaveLength(0);
		});

		it('should anonymize the entry if the requested resources match with contributions that are private to the user', () => {
			const context: RegistryFilterContext = {
				showAll: false,
				userAdministeredResourceIds: [],
				requestedResources: ['resource-1'],
			};
			const contributions: ContributionEntry[] = [
				{
					resource_id: 'resource-1',
					groups: [privateGroupRes1],
				} as ContributionEntry,
			];
			const result = rule.applyFilter(
				context,
				buildEntryWithContributions(contributions),
			);
			expect(result).toHaveLength(1);
			expect(result[0].curator_orcid).toBe(''); // anonymized
			expect(result[0].curator?.displayedName).toBe('Private User');
			expect(result[0].contributed_to).toHaveLength(0);
		});
	});
});
