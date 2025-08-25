import { PrivacyType } from 'src/core/enums';
import { CuratorRegistryEntry } from 'src/core/schemas/curator-registry/curator-entry.schema';
import { PartnerResource } from 'src/core/schemas/index';
import { League } from 'src/core/schemas/league/league.schema';
import { RegistryFilterContext } from '../rules/filters.interface';
import { PrivacyFilterStrategy } from './privacy.strategy';

describe('PrivacyFilterStrategy', () => {
	let strategy: PrivacyFilterStrategy;

	const publicLeagueRes1: League = {
		resource_id: 'res1',
		visibility: PrivacyType.public,
	} as League;

	const privateLeagueRes1: League = {
		resource_id: 'res1',
		visibility: PrivacyType.private,
	} as League;

	const publicContributorRes1: CuratorRegistryEntry = {
		curator_orcid: '0000-0001',
		privacy: PrivacyType.public,
		contributed_to: [
			{
				resource_id: 'res1',
				resource: {} as PartnerResource,
				groups: [publicLeagueRes1],
			},
		],
	} as CuratorRegistryEntry;

	const privateContributorRes1: CuratorRegistryEntry = {
		curator_orcid: '0000-0011',
		privacy: PrivacyType.private,
		curator: null,
		contributed_to: [
			{
				resource_id: 'res1',
				resource: {} as PartnerResource,
				groups: [publicLeagueRes1],
			},
		],
	} as CuratorRegistryEntry;

	const privateUserRes2: CuratorRegistryEntry = {
		curator_orcid: '0000-0002',
		privacy: PrivacyType.private,
		curator: null,
		contributed_to: [
			{
				resource_id: 'res2',
				resource: {} as PartnerResource,
				groups: [privateLeagueRes1],
			},
		],
	};

	beforeEach(() => {
		strategy = new PrivacyFilterStrategy();
	});

	it('should return only public users when no admin rights and showAll=false', () => {
		const context = {
			showAll: false,
			userAdministeredResourceIds: [],
			requestedResources: [],
		};
		const result = strategy.filter(context, [
			publicContributorRes1,
			privateUserRes2,
		]);

		expect(result.length).toBe(1);
		expect(result.map((entry) => entry.curator_orcid)).toEqual([
			publicContributorRes1.curator_orcid,
		]); // show public entries
	});

	it('should include private users if user administers their resource, but not from other resources', () => {
		const context = {
			showAll: false,
			userAdministeredResourceIds: ['res1'],
			requestedResources: [],
		};
		const result = strategy.filter(context, [
			publicContributorRes1,
			privateContributorRes1,
			privateUserRes2,
		]);
		expect(result.length).toBe(2);
		expect(result).toEqual([publicContributorRes1, privateContributorRes1]);
	});

	const mixedContributionUser: CuratorRegistryEntry = {
		curator_orcid: '0000-0003',
		privacy: PrivacyType.public,
		curator: null,
		contributed_to: [
			{
				resource_id: 'res1',
				resource: {} as PartnerResource,
				groups: [publicLeagueRes1, privateLeagueRes1],
			},
		],
	};

	it('Should display only contributions to public groups if the user has no admin rights for the resource', () => {
		const context = {
			showAll: false,
			userAdministeredResourceIds: ['res2'],
		};
		const result = strategy.filter(context, [mixedContributionUser]);

		expect(result.length).toBe(1);
		expect(result[0].contributed_to.length).toEqual(1); // hide private group
		expect(result[0].contributed_to[0].groups).toEqual([publicLeagueRes1]);
	});

	it('Should display contributions to privat groups if the user administers their resource', () => {
		const context: RegistryFilterContext = {
			showAll: false,
			userAdministeredResourceIds: ['res1'],
		};
		const result = strategy.filter(context, [mixedContributionUser]);

		expect(result.length).toBe(1);
		expect(result[0].contributed_to.length).toEqual(1); // show private group
		expect(result[0].contributed_to[0].groups).toEqual([
			publicLeagueRes1,
			privateLeagueRes1,
		]);
	});

	const privateContributionUser: CuratorRegistryEntry = {
		curator_orcid: '0000-0004',
		privacy: PrivacyType.public,
		curator: null,
		contributed_to: [
			{
				resource_id: 'res1',
				resource: {} as PartnerResource,
				groups: [privateLeagueRes1],
			},
		],
	};

	it('Should hide the contribution if they are not visible to the requesting user', () => {
		const context = {
			showAll: false,
			userAdministeredResourceIds: ['res2'],
		};
		const result = strategy.filter(context, [privateContributionUser]);

		expect(result[0].contributed_to.length).toBe(0);
	});

	const privateLeagueRes2: League = {
		resource_id: 'res2',
		visibility: PrivacyType.private,
	} as League;
	const contributorWithMixedResources: CuratorRegistryEntry = {
		curator_orcid: '0000-0005',
		privacy: PrivacyType.public,
		curator: null,
		contributed_to: [
			{
				resource_id: 'res1',
				resource: {} as PartnerResource,
				groups: [publicLeagueRes1],
			},
			{
				resource_id: 'res2',
				resource: {} as PartnerResource,
				groups: [privateLeagueRes2],
			},
		],
	};

	it('Should not return entries not requested by the user', () => {
		const context: RegistryFilterContext = {
			showAll: false,
			userAdministeredResourceIds: [],
			requestedResources: ['res2'],
		};
		const result = strategy.filter(context, [contributorWithMixedResources]);
		// in this case the contribution to res2 should be hidden and therefore no entries should be returned
		expect(result.length).toBe(0);
	});

	it('Should not return entries not requested by the user', () => {
		const context: RegistryFilterContext = {
			showAll: false,
			userAdministeredResourceIds: ['res2'],
			requestedResources: ['res2'],
		};
		const result = strategy.filter(context, [contributorWithMixedResources]);
		expect(result.length).toBe(1);
		expect(result[0].contributed_to.length).toBe(2);
		expect(result[0].contributed_to[0].groups[0]).toEqual(publicLeagueRes1);
		expect(result[0].contributed_to[1].groups[0]).toEqual(privateLeagueRes2);
	});
});
