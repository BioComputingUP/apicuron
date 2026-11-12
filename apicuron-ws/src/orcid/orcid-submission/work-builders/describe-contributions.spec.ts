import { describeContributions } from './describe-contributions';

const activity = (activity_term: string, activity_name: string, count: number) => ({
	activity_term,
	activity_name,
	count,
});

const base = {
	resourceName: 'DisProt software',
	firstContribution: new Date('2024-03-01T00:00:00Z'),
	lastContribution: new Date('2026-10-01T00:00:00Z'),
	totalCount: 99,
};

describe('describeContributions', () => {
	it('names the top three activities and summarises the rest', () => {
		expect(
			describeContributions({
				...base,
				activities: [
					activity('feature_building', 'Feature Building', 3),
					activity('change_reviewing', 'Change Reviewing', 5),
					activity('change_integration', 'Change Integration', 1),
					activity('bug_fixing', 'Bug Fixing', 4),
					activity('test_writing', 'Test Writing', 1),
				],
			}),
		).toBe(
			'Between 2024 and 2026, credited on APICURON for 14 contributions to DisProt software, ' +
				'most often in Change Reviewing (5), Bug Fixing (4) and Feature Building (3), ' +
				'plus 2 contributions in 2 other activities.',
		);
	});

	it('lists every activity when there are three or fewer', () => {
		expect(
			describeContributions({
				...base,
				activities: [
					activity('change_reviewing', 'Change Reviewing', 5),
					activity('bug_fixing', 'Bug Fixing', 4),
				],
			}),
		).toBe(
			'Between 2024 and 2026, credited on APICURON for 9 contributions to DisProt software, ' +
				'in Change Reviewing (5) and Bug Fixing (4).',
		);
	});

	it('uses a single year and singular words when they apply', () => {
		expect(
			describeContributions({
				...base,
				firstContribution: new Date('2025-01-10T00:00:00Z'),
				lastContribution: new Date('2025-11-10T00:00:00Z'),
				activities: [activity('curation', 'Curation', 1)],
			}),
		).toBe(
			'In 2025, credited on APICURON for 1 contribution to DisProt software, all in Curation.',
		);
	});

	it('adds up the same activity coming from several entries', () => {
		expect(
			describeContributions({
				...base,
				activities: [
					activity('change_reviewing', 'Change Reviewing', 2),
					activity('change_reviewing', 'Change Reviewing', 3),
				],
			}),
		).toBe(
			'Between 2024 and 2026, credited on APICURON for 5 contributions to DisProt software, all in Change Reviewing.',
		);
	});

	it('collapses extra spaces in activity labels', () => {
		expect(
			describeContributions({
				...base,
				activities: [activity('region_revised', ' Region  revised ', 5)],
			}),
		).toBe(
			'Between 2024 and 2026, credited on APICURON for 5 contributions to DisProt software, all in Region revised.',
		);
	});

	it('falls back to the total count without per-activity counts', () => {
		expect(describeContributions({ ...base, activities: [] })).toBe(
			'Between 2024 and 2026, credited on APICURON for 99 contributions to DisProt software.',
		);
	});
});
